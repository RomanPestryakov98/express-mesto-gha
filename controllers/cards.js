const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => res.status(500).send({ message: 'Неизвестная ошибка' }));
};

module.exports.createCards = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      return res.status(500).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.id)
    .then((card) => {
      if (!card) {
        return Promise.reject(new Error('Карточки не существует'));
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.message === 'Карточки не существует') {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Некорректный id карточки' });
      }
      return res.status(500).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return Promise.reject(new Error('Карточки не существует'));
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.message === 'Карточки не существует') {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Передан несуществующий _id карточки' });
      }
      return res.status(500).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return Promise.reject(new Error('Карточки не существует'));
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Передан несуществующий _id карточки' });
      }
      if (err.message === 'Карточки не существует') {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }
      return res.status(500).send({ message: 'Неизвестная ошибка' });
    });
};
