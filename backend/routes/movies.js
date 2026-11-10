const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Movie, Genre, Country, Director, Actor } = require('../models');
const { POSTERS_DIR, MIME_EXTENSIONS, recordPoster, clearPoster, deletePoster, withPosterUrl } = require('../utils/posters');
const tmdb = require('../utils/tmdb');
const { validate } = require('../validation/validate');
const schemas = require('../validation/schemas');
const router = express.Router();

// Poster upload: images only, stored as <movieId>.<ext> with ext derived from mimetype
const posterUpload = multer({
  storage: multer.diskStorage({
    destination: POSTERS_DIR,
    filename: (req, file, cb) => {
      cb(null, `${req.params.id}.${MIME_EXTENSIONS[file.mimetype]}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (MIME_EXTENSIONS[file.mimetype]) return cb(null, true);
    cb(new Error('Only JPEG, PNG or WebP images are allowed'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Get all movies with associations
router.get('/', async (req, res) => {
  const movies = await Movie.findAll({
    include: [Genre, Country, Director, Actor]
  });
  res.json(withPosterUrl(movies));
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  const movie = await Movie.findByPk(req.params.id, {
    include: [Genre, Country, Director, Actor]
  });
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(withPosterUrl(movie));
});

// Create movie
router.post('/', validate(schemas.movie), async (req, res) => {
  // Already checked and cleaned by the schema (a blank date arrives as null)
  const { title, alternativeTitle, releaseYear, rating, watchedDate, genreIds, countryIds, directorIds, actorIds } = req.body;

  const movie = await Movie.create({ title, alternativeTitle, releaseYear, rating, watchedDate });

  if (genreIds) await movie.setGenres(genreIds);
  if (countryIds) await movie.setCountries(countryIds);
  if (directorIds) await movie.setDirectors(directorIds);
  if (actorIds) await movie.setActors(actorIds);

  const movieWithAssociations = await Movie.findByPk(movie.id, {
    include: [Genre, Country, Director, Actor]
  });

  res.status(201).json(withPosterUrl(movieWithAssociations));
});

// Update movie
router.put('/:id', validate(schemas.movie), async (req, res) => {
  const { title, alternativeTitle, releaseYear, rating, watchedDate, genreIds, countryIds, directorIds, actorIds } = req.body;

  const movie = await Movie.findByPk(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  await movie.update({ title, alternativeTitle, releaseYear, rating, watchedDate });

  if (genreIds) await movie.setGenres(genreIds);
  if (countryIds) await movie.setCountries(countryIds);
  if (directorIds) await movie.setDirectors(directorIds);
  if (actorIds) await movie.setActors(actorIds);

  const updatedMovie = await Movie.findByPk(movie.id, {
    include: [Genre, Country, Director, Actor]
  });

  res.json(withPosterUrl(updatedMovie));
});

// Delete movie (and its poster file, if any)
router.delete('/:id', async (req, res) => {
  const movie = await Movie.findByPk(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  await movie.destroy();
  deletePoster(req.params.id);
  res.status(204).send();
});

// Upload/replace poster
router.post('/:id/poster', async (req, res, next) => {
  // The id becomes a filename — reject anything non-numeric before touching the filesystem
  if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ error: 'Movie not found' });

  const movie = await Movie.findByPk(req.params.id, {
    include: [Genre, Country, Director, Actor]
  });
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  posterUpload.single('poster')(req, res, (err) => {
    if (err) {
      const message = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large (max 10 MB)'
        : err.message;
      return res.status(400).json({ error: message });
    }
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    // Purge any old poster stored under a different extension
    const ext = MIME_EXTENSIONS[req.file.mimetype];
    deletePoster(req.params.id, ext);
    recordPoster(movie, ext).then(() => res.json(withPosterUrl(movie))).catch(next);
  });
});

// Set poster from a TMDB search result
router.post('/:id/poster/tmdb', async (req, res) => {
  try {
    // The id becomes a filename — reject anything non-numeric before touching the filesystem
    if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ error: 'Movie not found' });

    const movie = await Movie.findByPk(req.params.id, {
      include: [Genre, Country, Director, Actor]
    });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    const { posterPath } = req.body || {};
    const { buffer, ext } = await tmdb.downloadPoster(posterPath || '');

    fs.writeFileSync(path.join(POSTERS_DIR, `${req.params.id}.${ext}`), buffer);
    // Purge any old poster stored under a different extension
    deletePoster(req.params.id, ext);
    await recordPoster(movie, ext);
    res.json(withPosterUrl(movie));
  } catch (error) {
    if (error.badRequest) return res.status(400).json({ error: error.message });
    res.status(502).json({ error: error.message });
  }
});

// Delete poster
router.delete('/:id/poster', async (req, res) => {
  const movie = await Movie.findByPk(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  deletePoster(req.params.id);
  await clearPoster(movie);
  res.status(204).send();
});

module.exports = router;
