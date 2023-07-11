const router = require('express').Router();
const {
  createUser, getUsers, getUser, updateAvatar, updateUser,
} = require('../controllers/users');

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.patch('/me', updateAvatar);
router.patch('/me/avatar', updateUser);

module.exports = router;
