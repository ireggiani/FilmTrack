const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// A TV series, mini-series or anime: the same fields as a Movie, kept in its
// own table so the two lists never mix. releaseYear is the year it started,
// watchedDate the day it was finished.
const Series = sequelize.define('Series', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alternativeTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  releaseYear: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  watchedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  posterExt: {
    type: DataTypes.STRING,
    allowNull: true
  },
  posterVersion: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Series'
});

module.exports = Series;
