const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(500).send({ message: 'Неизвестная ошибка' }));
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Пользователь не существует'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Неккоректный id' });
      }
      if (err.message === 'Пользователь не существует') {
        return res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.status(500).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create(
    { name, about, avatar },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      return res.status(500).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.updateUser = (req, res) => {
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
        return Promise.reject(new Error('Некорректный id пользователя'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.message === 'Некорректный id пользователя' || err.name === 'CastError') {
        return res.status(400).send({ message: 'Некорректный id пользователя' });
      }
      if (err.name === 'ValidationError') {
        return res.status(404).send({ message: 'Переданы некорректные данные' });
      }
      return res.status(500).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(404).send({ message: 'Переданы некорректные данные' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Некорректный id пользователя' });
      }
      return res.status(500).send({ message: 'Неизвестная ошибка' });
    });
};
