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
        next(new BadRequest('Переданы некорректные данные'));
        return;
      }
      next(new InternalServerError());
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.id)
    .then((cardUser) => {
      if (!cardUser) {
        const errNotFound = new NotFound('Карточки не существует');
        throw errNotFound;
      }
      if (cardUser.owner.toString() !== req.user._id) {
        const errForbidden = new Forbidden('Нет прав на удаление карточки');
        throw errForbidden;
      }
      return Card.findByIdAndRemove(req.params.id)
        .then((card) => res.send(card));
    })
    .catch((err) => {
      if (err.name === 'NotFound') {
        next(err);
        return;
      }
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные'));
        return;
      }
      if (err.name === 'Forbidden') {
        next(err);
        return;
      }
      next(new InternalServerError());
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        const errNotFound = new NotFound('Карточки не существует');
        throw errNotFound;
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'NotFound') {
        next(err);
        return;
      }
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные'));
        return;
      }
      next(new InternalServerError());
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        const errNotFound = new NotFound('Карточки не существует');
        throw errNotFound;
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные'));
        return;
      }
      if (err.name === 'NotFound') {
        next(err);
        return;
      }
      next(new InternalServerError());
    });
};
