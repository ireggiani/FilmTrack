const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Director = sequelize.define('Director', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Director;