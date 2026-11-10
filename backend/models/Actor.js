const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Actor = sequelize.define('Actor', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  indexes: [{ name: 'actors_name_unique', unique: true, fields: [{ name: 'name', collate: 'NOCASE' }] }]
});

module.exports = Actor;