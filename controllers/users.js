const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const InternalServerError = require('../errors/InternalServerError');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');

module.exports.login = (req, res, next) => {
  const {
    email, password,
  } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      if (!users) {
        throw new InternalServerError();
      }
      return res.send(users);
    })
    .catch(next);
};

module.exports.infoUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .then((user) => {
      if (!user) {
        throw new InternalServerError();
      }
      return res.send(user);
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        const errNotFound = new NotFound('Пользователь не существует');
        throw errNotFound;
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Неккоректный id'));
        return;
      }
      if (err.name === 'NotFound') {
        next(err);
        return;
      }
      next(new InternalServerError());
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  User.findOne({ email })
    .then((admin) => {
      if (admin) {
        throw new Conflict();
      }
      bcrypt.hash(password, 10)
        .then((hash) => User.create({
          name, about, avatar, email, password: hash,
        }))
        .then((user) => res.send(user))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new BadRequest('Переданы некорректные данные'));
            return;
          }
          next(new InternalServerError());
        });
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        const errNotFound = new NotFound('Некорректный id пользователя');
        throw errNotFound;
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
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

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        const errNotFound = new NotFound('Некорректный id пользователя');
        throw errNotFound;
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
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
