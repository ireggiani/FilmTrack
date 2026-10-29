const { Sequelize } = require('sequelize');
require('dotenv').config();
const { DB_PATH } = require('./paths');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  // Absolute, so the database no longer depends on the folder the server is started from
  storage: DB_PATH,
  logging: false
});

module.exports = sequelize;
