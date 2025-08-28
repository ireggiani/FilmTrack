const express = require('express');
const { Movie, Genre, Country, Director, Actor } = require('../models');
const router = express.Router();

// Get all movies with associations
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.findAll({
      include: [Genre, Country, Director, Actor]
    });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, {
      include: [Genre, Country, Director, Actor]
    });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create movie
router.post('/', async (req, res) => {
  try {
    const { title, alternativeTitle, releaseYear, rating, watchedDate, genreIds, countryIds, directorIds, actorIds } = req.body;
    
    const movie = await Movie.create({
      title, alternativeTitle, releaseYear, rating, watchedDate
    });

    if (genreIds) await movie.setGenres(genreIds);
    if (countryIds) await movie.setCountries(countryIds);
    if (directorIds) await movie.setDirectors(directorIds);
    if (actorIds) await movie.setActors(actorIds);

    const movieWithAssociations = await Movie.findByPk(movie.id, {
      include: [Genre, Country, Director, Actor]
    });

    res.status(201).json(movieWithAssociations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update movie
router.put('/:id', async (req, res) => {
  try {
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

    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete movie
router.delete('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    
    await movie.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;