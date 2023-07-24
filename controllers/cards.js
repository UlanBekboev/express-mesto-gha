const BadRequestError = require('../errors/bad-request-err');
const { OK_STATUS, CREATED_STATUS } = require('../errors/status');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');

const Card = require('../models/cards');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(OK_STATUS).send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(CREATED_STATUS).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы неверные данные.'));
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const { _id } = req.user;
  Card.findById(cardId)
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена.');
      }
      if (card.owner.valueOf() !== _id) {
        throw new ForbiddenError('Нельзя удалить чужую карточку!');
      }
      Card.findByIdAndRemove(cardId)
        .then((deletedCard) => res.status(OK_STATUS).send(deletedCard))
        .catch(next);
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Карточка не найдена.'));
      }
      return res.status(200).send(card);
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(
          new NotFoundError('Карточка не найдена. Лайк не удалось убрать.'),
        );
      }
      return res.status(OK_STATUS).send(card);
    })
    .catch(next);
};
