require('dotenv').config();

const setupServer = require('./server');
const initMongoConnection = require('./db/initMongoConnection');

const bootstrap = async () => {
  await initMongoConnection();

  const app = setupServer();
  const PORT = Number(process.env.PORT) || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
