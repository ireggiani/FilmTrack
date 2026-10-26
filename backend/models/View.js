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
    allowNull: true,
    // SQLite hands this nullable JSON column back as its raw text
    get() {
      const raw = this.getDataValue('sorting');
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    }
  },
  // The starred view, applied when the Movies window opens. At most one.
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'views',
  timestamps: true
});

module.exports = View;
