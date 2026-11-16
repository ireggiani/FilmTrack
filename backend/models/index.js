const sequelize = require('../config/database');
const Movie = require('./Movie');
const Series = require('./Series');
const Genre = require('./Genre');
const Country = require('./Country');
const Director = require('./Director');
const Actor = require('./Actor');
const View = require('./View');
const Note = require('./Note');

// Many-to-many relationships
Movie.belongsToMany(Genre, { through: 'MovieGenres' });
Genre.belongsToMany(Movie, { through: 'MovieGenres' });

Movie.belongsToMany(Country, { through: 'MovieCountries' });
Country.belongsToMany(Movie, { through: 'MovieCountries' });

Movie.belongsToMany(Director, { through: 'MovieDirectors' });
Director.belongsToMany(Movie, { through: 'MovieDirectors' });

Movie.belongsToMany(Actor, { through: 'MovieActors' });
Actor.belongsToMany(Movie, { through: 'MovieActors' });

// Series link to the same genres, countries, directors and actors as movies
Series.belongsToMany(Genre, { through: 'SeriesGenres' });
Genre.belongsToMany(Series, { through: 'SeriesGenres' });

Series.belongsToMany(Country, { through: 'SeriesCountries' });
Country.belongsToMany(Series, { through: 'SeriesCountries' });

Series.belongsToMany(Director, { through: 'SeriesDirectors' });
Director.belongsToMany(Series, { through: 'SeriesDirectors' });

Series.belongsToMany(Actor, { through: 'SeriesActors' });
Actor.belongsToMany(Series, { through: 'SeriesActors' });

module.exports = {
  sequelize,
  Movie,
  Series,
  Genre,
  Country,
  Director,
  Actor,
  View,
  Note
};