const router = require('express').Router();
const cardRouter = require('./cards');
const userRouter = require('./users');

router.use('/cards', cardRouter);
router.use('/users', userRouter);

module.exports = router;
