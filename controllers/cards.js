const {
  NOT_FOUND_ERROR,
  BAD_REQUEST_ERROR,
  OK_STATUS, FORBIDDEN_ERROR,
  CREATED_STATUS,
  INTERNAL_SERVER_ERROR,
} = require('../validationErrors/errors');

const Card = require('../models/cards');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(OK_STATUS).send(cards))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некоректные данные.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'непредвиденная ошибка сервера' });
      }
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(CREATED_STATUS).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некоректные данные.' });
      }
      res.status(INTERNAL_SERVER_ERROR).send({ message: 'непредвиденная ошибка сервера' });
    });
};

module.exports.deleteCard = (req, res) => {
  const { _id } = req.user;
  Card.findById(req.params.id)
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Карточка не найдена' });
      } else if (card.owner.valueOf() !== _id) {
        res.status(FORBIDDEN_ERROR).send({ message: 'Нельзя удалить чужую карточку!' });
      } else {
        res.status(OK_STATUS).send(card);
      }
    });
  Card.findByIdAndRemove(req.params.id)
    .then((deletedCard) => res.status(OK_STATUS).send(deletedCard))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некоректные данные.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'непредвиденная ошибка сервера' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true })
    .then((card) => {
      if (!card) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Карточка не найдена' });
      } else {
        res.status(OK_STATUS).send(card);
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

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true })
    .then((card) => {
      if (!card) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Переданы некоректные данные.' });
      } else {
        res.status(OK_STATUS).send(card);
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
