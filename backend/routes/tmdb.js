const express = require('express');
const tmdb = require('../utils/tmdb');
const router = express.Router();

// Search TMDB for movies matching a title (and optional year)
router.get('/search', async (req, res) => {
  const { query, year } = req.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Missing search query' });
  }
  if (!tmdb.isConfigured()) {
    return res.status(503).json({
      error: 'TMDB API key not configured. Add TMDB_API_KEY to backend/.env and restart the server.'
    });
  }

  try {
    const results = await tmdb.searchMovies(query.trim(), year);
    res.json(results);
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

module.exports = router;
