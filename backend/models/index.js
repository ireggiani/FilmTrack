const sequelize = require('../config/database');
const Movie = require('./Movie');
const Genre = require('./Genre');
const Country = require('./Country');
const Director = require('./Director');
const Actor = require('./Actor');

// Many-to-many relationships
Movie.belongsToMany(Genre, { through: 'MovieGenres' });
Genre.belongsToMany(Movie, { through: 'MovieGenres' });

Movie.belongsToMany(Country, { through: 'MovieCountries' });
Country.belongsToMany(Movie, { through: 'MovieCountries' });

Movie.belongsToMany(Director, { through: 'MovieDirectors' });
Director.belongsToMany(Movie, { through: 'MovieDirectors' });

Movie.belongsToMany(Actor, { through: 'MovieActors' });
Actor.belongsToMany(Movie, { through: 'MovieActors' });

module.exports = {
  sequelize,
  Movie,
  Genre,
  Country,
  Director,
  Actor
};