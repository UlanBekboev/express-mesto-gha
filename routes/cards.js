const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const validator = require('validator');
const BadRequestError = require('../errors/bad-request-err');
const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

const cardIdValidation = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().length(24).hex(),
  }),
});

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().custom((value) => {
      if (!validator.isURL(value, { require_protocol: true })) {
        throw new BadRequestError('Неправильный формат URL адреса');
      }
      return value;
    }),
  }),
}), createCard);

router.delete('/:id', cardIdValidation, deleteCard);
router.put('/:id/likes', cardIdValidation, likeCard);
router.delete('/:id/likes', cardIdValidation, dislikeCard);

module.exports = router;
