const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NotFoundError = require('../errors/not-found-err');
const { OK_STATUS } = require('../errors/status');

const User = require('../models/users');
const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');

module.exports.createUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new BadRequestError('Неправильный логин или пароль.'));
  }
  return User.findOne({ email })
    .then((user) => {
      if (user) {
        next(new ConflictError(`Пользователь с ${email} уже существует.`));
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => {
      User.create({
        email,
        password: hash,
        name: req.body.name,
        about: req.body.about,
        avatar: req.body.avatar,
      });
    })
    .then((user) => res.status(200).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(
          new BadRequestError('Неверные данные о пользователе или неверная ссылка на аватар.'),
        );
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user || !password) {
        return next(new BadRequestError('Неверный email или пароль.'));
      }
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', {
        expiresIn: '7d',
      });
      return res.send({ token });
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(OK_STATUS).send(users))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const { id } = req.params;

  User.findById(id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      } else {
        res.status(OK_STATUS).send(user);
      }
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Неверная ссылка');
      }
      return next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(OK_STATUS).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Неверный тип данных.');
      }
      return next(err);
    });
};

module.exports.getProfile = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.status(OK_STATUS).send(user);
    })
    .catch(next);
};
