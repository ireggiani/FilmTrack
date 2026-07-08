const express = require('express');
const { POSTERS_DIR, ensureThumb } = require('../utils/posters');
const router = express.Router();

// Aggressive caching is safe: poster URLs carry an mtime cache-buster (?v=)
const CACHE_OPTS = { maxAge: '30d', immutable: true };

const POSTER_FILE_RE = /^\d+\.(jpg|png|webp)$/;

// Thumbnail, generated on first request (and regenerated when the original changes)
router.get('/thumbs/:file', async (req, res) => {
  const { file } = req.params;
  if (!POSTER_FILE_RE.test(file)) return res.status(404).send('Not found');

  try {
    const thumbPath = await ensureThumb(file);
    if (!thumbPath) return res.status(404).send('Not found');
    res.sendFile(thumbPath, CACHE_OPTS);
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    res.status(500).send('Thumbnail generation failed');
  }
});

// Full-size originals
router.use(express.static(POSTERS_DIR, CACHE_OPTS));

module.exports = router;
