const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Genre, Country, Director, Actor } = require('../models');
const { MIME_EXTENSIONS } = require('../utils/posters');
const tmdb = require('../utils/tmdb');
const { validate } = require('../validation/validate');

const INCLUDE = [Genre, Country, Director, Actor];

// The routes shared by Movies and Series: the same fields, the same links to
// genres, countries, directors and actors, and a poster each.
//   Model    the Sequelize model
//   posters  its poster store (utils/posters.js)
//   schema   the Zod schema for create and update
//   label    what it's called in messages ("Movie not found")
function collectionRouter({ Model, posters, schema, label }) {
  const router = express.Router();
  const notFound = (res) => res.status(404).json({ error: `${label} not found` });

  // Poster upload: images only, stored as <id>.<ext> with ext derived from mimetype
  const posterUpload = multer({
    storage: multer.diskStorage({
      destination: posters.dir,
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

  const setLinks = async (record, { genreIds, countryIds, directorIds, actorIds }) => {
    if (genreIds) await record.setGenres(genreIds);
    if (countryIds) await record.setCountries(countryIds);
    if (directorIds) await record.setDirectors(directorIds);
    if (actorIds) await record.setActors(actorIds);
  };

  // Get all, with associations
  router.get('/', async (req, res) => {
    const records = await Model.findAll({ include: INCLUDE });
    res.json(posters.withPosterUrl(records));
  });

  // Get one by ID
  router.get('/:id', async (req, res) => {
    const record = await Model.findByPk(req.params.id, { include: INCLUDE });
    if (!record) return notFound(res);
    res.json(posters.withPosterUrl(record));
  });

  // Create
  router.post('/', validate(schema), async (req, res) => {
    // Already checked and cleaned by the schema (a blank date arrives as null)
    const { title, alternativeTitle, releaseYear, rating, watchedDate } = req.body;

    const record = await Model.create({ title, alternativeTitle, releaseYear, rating, watchedDate });
    await setLinks(record, req.body);

    const created = await Model.findByPk(record.id, { include: INCLUDE });
    res.status(201).json(posters.withPosterUrl(created));
  });

  // Update
  router.put('/:id', validate(schema), async (req, res) => {
    const { title, alternativeTitle, releaseYear, rating, watchedDate } = req.body;

    const record = await Model.findByPk(req.params.id);
    if (!record) return notFound(res);

    await record.update({ title, alternativeTitle, releaseYear, rating, watchedDate });
    await setLinks(record, req.body);

    const updated = await Model.findByPk(record.id, { include: INCLUDE });
    res.json(posters.withPosterUrl(updated));
  });

  // Delete (and its poster file, if any)
  router.delete('/:id', async (req, res) => {
    const record = await Model.findByPk(req.params.id);
    if (!record) return notFound(res);

    await record.destroy();
    posters.deletePoster(req.params.id);
    res.status(204).send();
  });

  // Upload/replace poster
  router.post('/:id/poster', async (req, res, next) => {
    // The id becomes a filename — reject anything non-numeric before touching the filesystem
    if (!/^\d+$/.test(req.params.id)) return notFound(res);

    const record = await Model.findByPk(req.params.id, { include: INCLUDE });
    if (!record) return notFound(res);

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
      posters.deletePoster(req.params.id, ext);
      posters.recordPoster(record, ext).then(() => res.json(posters.withPosterUrl(record))).catch(next);
    });
  });

  // Set poster from a TMDB search result
  router.post('/:id/poster/tmdb', async (req, res) => {
    try {
      // The id becomes a filename — reject anything non-numeric before touching the filesystem
      if (!/^\d+$/.test(req.params.id)) return notFound(res);

      const record = await Model.findByPk(req.params.id, { include: INCLUDE });
      if (!record) return notFound(res);

      const { posterPath } = req.body || {};
      const { buffer, ext } = await tmdb.downloadPoster(posterPath || '');

      fs.writeFileSync(path.join(posters.dir, `${req.params.id}.${ext}`), buffer);
      // Purge any old poster stored under a different extension
      posters.deletePoster(req.params.id, ext);
      await posters.recordPoster(record, ext);
      res.json(posters.withPosterUrl(record));
    } catch (error) {
      if (error.badRequest) return res.status(400).json({ error: error.message });
      res.status(502).json({ error: error.message });
    }
  });

  // Delete poster
  router.delete('/:id/poster', async (req, res) => {
    const record = await Model.findByPk(req.params.id);
    if (!record) return notFound(res);

    posters.deletePoster(req.params.id);
    await posters.clearPoster(record);
    res.status(204).send();
  });

  return router;
}

module.exports = collectionRouter;
