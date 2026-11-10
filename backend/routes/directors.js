const express = require('express');
const { Director } = require('../models');
const { validate } = require('../validation/validate');
const schemas = require('../validation/schemas');
const router = express.Router();

router.get('/', async (req, res) => {
  const directors = await Director.findAll();
  res.json(directors);
});

router.post('/', validate(schemas.director.create), async (req, res) => {
  const director = await Director.create(req.body);
  res.status(201).json(director);
});

router.put('/:id', validate(schemas.director.update), async (req, res) => {
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
