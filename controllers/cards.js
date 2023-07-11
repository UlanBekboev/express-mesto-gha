const {
  NOT_FOUND_ERROR, BAD_REQUEST_ERROR, OK_STATUS, FORBIDDEN_ERROR,
} = require('../validationErrors/errors');

const Card = require('../models/cards');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(OK_STATUS).send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(OK_STATUS).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некоректные данные.' });
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
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
        next();
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true })
    .then((card) => {
      if (!card) {
        res.status(BAD_REQUEST_ERROR).send({ message: 'Переданы некоректные данные.' });
      } else {
        res.status(OK_STATUS).send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(NOT_FOUND_ERROR).send({ message: 'Карточка не найдена' });
      } else {
        next();
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
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
        next();
      }
    });
};
