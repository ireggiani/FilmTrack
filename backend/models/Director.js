const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Director = sequelize.define('Director', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  indexes: [{ name: 'directors_name_unique', unique: true, fields: [{ name: 'name', collate: 'NOCASE' }] }]
});

module.exports = Director;