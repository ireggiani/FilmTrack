const express = require('express');
const { POSTERS_DIR, moviePosters, seriesPosters } = require('../utils/posters');
const router = express.Router();

// Aggressive caching is safe: poster URLs carry an mtime cache-buster (?v=)
const CACHE_OPTS = { maxAge: '30d', immutable: true };

const POSTER_FILE_RE = /^\d+\.(jpg|png|webp)$/;

// Thumbnail, generated on first request (and regenerated when the original changes)
const thumbnail = (posters) => async (req, res) => {
  const { file } = req.params;
  if (!POSTER_FILE_RE.test(file)) return res.status(404).send('Not found');

  const thumbPath = await posters.ensureThumb(file);
  if (!thumbPath) return res.status(404).send('Not found');
  res.sendFile(thumbPath, CACHE_OPTS);
};

router.get('/thumbs/:file', thumbnail(moviePosters));
router.get('/series/thumbs/:file', thumbnail(seriesPosters));

// Full-size originals: movies at the top, series under series/
router.use(express.static(POSTERS_DIR, CACHE_OPTS));

module.exports = router;
