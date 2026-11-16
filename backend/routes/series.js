const { Series } = require('../models');
const { seriesPosters } = require('../utils/posters');
const schemas = require('../validation/schemas');
const collectionRouter = require('./collection');

module.exports = collectionRouter({ Model: Series, posters: seriesPosters, schema: schemas.series, label: 'Series' });
