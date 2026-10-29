const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const { ValidationError, UniqueConstraintError } = require('sequelize');

// Builds the Express app without starting it, so tests can drive it with supertest
function createApp() {
  const app = express();

  app.use(compression());
  // Dev goes through the Vite proxy, so the API and posters are always same-origin
  app.use(helmet());
  app.use(express.json());

  // API Routes - must come before static files
  app.use('/api/movies', require('./routes/movies'));
  app.use('/api/genres', require('./routes/genres'));
  app.use('/api/countries', require('./routes/countries'));
  app.use('/api/directors', require('./routes/directors'));
  app.use('/api/actors', require('./routes/actors'));
  app.use('/api/database', require('./routes/database'));
  app.use('/api/views', require('./routes/views'));
  app.use('/api/notes', require('./routes/notes'));
  app.use('/api/tmdb', require('./routes/tmdb'));

  app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running!' });
  });

  // Movie posters (originals + on-demand thumbnails)
  app.use('/posters', require('./routes/posters'));

  // Serve static files from public directory with fallback to index.html for SPA
  app.use(express.static(path.join(__dirname, 'public'), {
    index: false
  }));

  // SPA fallback: serve index.html for non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // One error handler for every route. Express 5 forwards errors thrown in
  // async handlers here, so routes don't need their own try/catch.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    let status = err.status ?? 500;
    let message = err.message;
    if (err instanceof UniqueConstraintError) {
      status = 409;
      message = 'That name is already in use';
    } else if (err instanceof ValidationError) {
      status = 400;
    } else if (err instanceof multer.MulterError) {
      status = 400;
      if (err.code === 'LIMIT_FILE_SIZE') message = 'The file is too large';
    }
    if (status >= 500) console.error(err);
    res.status(status).json({ error: message });
  });

  return app;
}

module.exports = { createApp };
