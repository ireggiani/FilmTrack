const express = require('express');
const { Actor } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const actors = await Actor.findAll();
    res.json(actors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const actor = await Actor.create(req.body);
    res.status(201).json(actor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const actor = await Actor.findByPk(req.params.id);
    if (!actor) return res.status(404).json({ error: 'Actor not found' });
    
    await actor.update(req.body);
    res.json(actor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const actor = await Actor.findByPk(req.params.id);
    if (!actor) return res.status(404).json({ error: 'Actor not found' });
    
    await actor.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;