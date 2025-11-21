const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const View = sequelize.define('View', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  filters: {
    type: DataTypes.JSON,
    allowNull: false
  },
  sorting: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'views',
  timestamps: true
});

module.exports = View;
