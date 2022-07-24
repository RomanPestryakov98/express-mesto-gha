const Card = require('../models/card');
const InternalServerError = require('../errors/InternalServerError');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      if (!cards) {
        throw new InternalServerError();
      }
      res.send(cards);
    })
    .catch(next);
};

module.exports.createCards = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Переданы некорректные данные');
      }
      throw new InternalServerError();
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.id)
    .then((cardUser) => {
      if (!cardUser) {
        throw new NotFound('Карточки не существует');
      }
      if (cardUser.owner.toString() !== req.user._id) {
        throw new Forbidden('Нет прав на удаление карточки');
      }
      return Card.findByIdAndRemove(req.params.id)
        .then((card) => res.send(card));
    })
    .catch((err) => {
      if (err.message === 'Карточки не существует') {
        return Promise.reject(err);
      }
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные');
      }
      if (err.message === 'Нет прав на удаление карточки') {
        return Promise.reject(err);
      }
      throw new InternalServerError();
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточки не существует');
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.message === 'Карточки не существует') {
        return Promise.reject(err);
      }
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные');
      }
      throw new InternalServerError();
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточки не существует');
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные');
      }
      if (err.message === 'Карточки не существует') {
        return Promise.reject(err);
      }
      throw new InternalServerError();
    })
    .catch(next);
};
