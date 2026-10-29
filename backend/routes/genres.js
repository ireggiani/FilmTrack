const express = require('express');
const { Genre } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  const genres = await Genre.findAll();
  res.json(genres);
});

router.post('/', async (req, res) => {
  const genre = await Genre.create(req.body);
  res.status(201).json(genre);
});

router.put('/:id', async (req, res) => {
  const genre = await Genre.findByPk(req.params.id);
  if (!genre) return res.status(404).json({ error: 'Genre not found' });

  await genre.update(req.body);
  res.json(genre);
});

router.delete('/:id', async (req, res) => {
  const genre = await Genre.findByPk(req.params.id);
  if (!genre) return res.status(404).json({ error: 'Genre not found' });

  await genre.destroy();
  res.status(204).send();
});

module.exports = router;
