const Card = require('../models/cards');
const BadRequestError = require('../validationErrors/BadRequestError');
const ForbiddenError = require('../validationErrors/ForbiddenError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы неверные данные.'));
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { _id } = req.user;
  Card.findById(req.params._id)
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        throw new BadRequestError('Переданы неверные данные.');
      }
      if (card.owner.valueOf() !== _id) {
        throw new ForbiddenError('Нельзя удалить чужую карточку!');
      }
      Card.findByIdAndRemove(req.params._id)
        .then((deletedCard) => res.status(200).send(deletedCard))
        .catch(next);
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params._id,
    { $addToSet: { likes: req.user._id } },
    { new: true })
    .then((card) => {
      if (!card) {
        return next(new BadRequestError('Переданы неверные данные.'));
      }
      return res.status(200).send(card);
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params._id,
    { $pull: { likes: req.user._id } },
    { new: true })
    .then((card) => {
      if (!card) {
        return next(new BadRequestError('Переданы неверные данные.'));
      }
      return res.status(200).send(card);
    })
    .catch(next);
};
