const express = require('express');
const { Country } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  const countries = await Country.findAll();
  res.json(countries);
});

router.post('/', async (req, res) => {
  const country = await Country.create(req.body);
  res.status(201).json(country);
});

router.put('/:id', async (req, res) => {
  const country = await Country.findByPk(req.params.id);
  if (!country) return res.status(404).json({ error: 'Country not found' });

  await country.update(req.body);
  res.json(country);
});

router.delete('/:id', async (req, res) => {
  const country = await Country.findByPk(req.params.id);
  if (!country) return res.status(404).json({ error: 'Country not found' });

  await country.destroy();
  res.status(204).send();
});

module.exports = router;
