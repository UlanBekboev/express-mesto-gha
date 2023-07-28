const router = require('express').Router();
const {
  userIdValidation,
  updateUserValidation,
  updateAvatarValidation,
} = require('../middlewares/validations');
const {
  getUsers, getUser, updateAvatar, updateUser, getProfile,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getProfile);

router.get('/:id', userIdValidation, getUser);

router.patch('/me', updateUserValidation, updateUser);

router.patch('/me/avatar', updateAvatarValidation, updateAvatar);

module.exports = router;
