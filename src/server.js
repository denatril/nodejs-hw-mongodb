const express = require('express');
const cors = require('cors');
const pino = require('pino-http');
const cookieParser = require('cookie-parser');
const contactsRouter = require('./routers/contacts');
const authRouter = require('./routers/auth');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');

const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(pino());
  app.use(express.json());
  app.use(cookieParser());

  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = setupServer;
