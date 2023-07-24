const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const router = require('express').Router();
const BadRequestError = require('../errors/bad-request-err');
const {
  getUsers, getUser, updateAvatar, updateUser, getProfile,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getProfile);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().required().length(24).hex(),
  }),
}), getUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().custom((value) => {
      if (!validator.isURL(value, { required_protocol: true })) {
        throw new BadRequestError('Неправильный формат URL адреса');
      }
      return value;
    }),
  }),
}), updateAvatar);

module.exports = router;
