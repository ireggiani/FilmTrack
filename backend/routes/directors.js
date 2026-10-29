const express = require('express');
const { Director } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  const directors = await Director.findAll();
  res.json(directors);
});

router.post('/', async (req, res) => {
  const director = await Director.create(req.body);
  res.status(201).json(director);
});

router.put('/:id', async (req, res) => {
  const director = await Director.findByPk(req.params.id);
  if (!director) return res.status(404).json({ error: 'Director not found' });

  await director.update(req.body);
  res.json(director);
});

router.delete('/:id', async (req, res) => {
  const director = await Director.findByPk(req.params.id);
  if (!director) return res.status(404).json({ error: 'Director not found' });

  await director.destroy();
  res.status(204).send();
});

module.exports = router;
