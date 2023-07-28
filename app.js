const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors, Joi, celebrate } = require('celebrate');
const validator = require('validator');
const NotFoundError = require('./errors/not-found-err');
const BadRequestError = require('./errors/bad-request-err');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const config = require('./config');
const rootRouter = require('./routes/index');
// eslint-disable-next-line
const port = config.port;
const DB_URL = config.databaseUrl;

const app = express();
app.use(helmet());

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).max(30),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).max(30),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom((value) => {
      if (!validator.isURL(value, { require_protocol: true })) {
        throw new BadRequestError('Неправильный формат URL адреса');
      }
      return value;
    }),
  }),
}), createUser);

app.use(auth);

app.use('/', rootRouter);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});
app.use(errors());
// eslint-disable-next-line
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${port}`);
});
