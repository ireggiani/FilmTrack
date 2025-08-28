const express = require('express');
const { Director } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const directors = await Director.findAll();
    res.json(directors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const director = await Director.create(req.body);
    res.status(201).json(director);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const director = await Director.findByPk(req.params.id);
    if (!director) return res.status(404).json({ error: 'Director not found' });
    
    await director.update(req.body);
    res.json(director);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const director = await Director.findByPk(req.params.id);
    if (!director) return res.status(404).json({ error: 'Director not found' });
    
    await director.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;