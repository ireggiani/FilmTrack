const { Movie } = require('../models');
const { moviePosters } = require('../utils/posters');
const schemas = require('../validation/schemas');
const collectionRouter = require('./collection');

module.exports = collectionRouter({ Model: Movie, posters: moviePosters, schema: schemas.movie, label: 'Movie' });
