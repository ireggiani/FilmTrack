const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movie = sequelize.define('Movie', {
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
});

module.exports = Movie;