const express = require('express');
const cors = require('cors');
const pino = require('pino-http');
const {
  getContactsController,
  getContactByIdController,
} = require('./controllers/contacts');

const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(pino());
  app.use(express.json());

  app.get('/contacts', getContactsController);
  app.get('/contacts/:contactId', getContactByIdController);

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.use((error, req, res, _next) => {
    res.status(500).json({
      status: 500,
      message: 'Something went wrong',
    });
  });

  return app;
};

module.exports = setupServer;
