const {
  BAD_REQUEST_ERROR, OK_STATUS, CREATED_STATUS, INTERNAL_SERVER_ERROR, NOT_FOUND_ERROR,
} = require('../validationErrors/errors');

const User = require('../models/users');

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => {
      res.status(CREATED_STATUS).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некоректные данные.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'непредвиденная ошибка сервера' });
      }
    });
};

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch(() => {
      res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы неверные данные.' });
    });
};

module.exports.getUser = (req, res) => {
  const { id } = req.params;

  User.findById(id)
    .then((user) => {
      if (!user) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Переданы некоректные данные.' });
      } else {
        res.status(OK_STATUS).send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некоректные данные.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'непредвиденная ошибка сервера' });
      }
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id,
    { avatar },
    { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Переданы некоректные данные.' });
      } else {
        res.status(OK_STATUS).send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Неверная ссылка' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'непредвиденная ошибка сервера' });
      }
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Переданы некоректные данные.' });
      } else {
        res.status(OK_STATUS).send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Неверный тип данных.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'непредвиденная ошибка сервера' });
      }
    });
};
