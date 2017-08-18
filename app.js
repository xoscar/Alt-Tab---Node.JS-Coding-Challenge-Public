// dependencies.
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const logger = require('morgan');
const cors = require('cors');

// routes
const users = require('./routes/userRoute');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(`${process.env.MONGODB_PORT_27017_TCP_ADDR || 'locahost:27017'}/users`);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');

  app.set('port', process.env.APP_PORT || 3000);
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(cors());

  app.use('/api', users);

  /**
   * Start Express server.
   */
  app.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
  });
});

module.exports = app;
