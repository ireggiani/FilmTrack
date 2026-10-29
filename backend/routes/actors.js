const express = require('express');
const { Actor } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  const actors = await Actor.findAll();
  res.json(actors);
});

router.post('/', async (req, res) => {
  const actor = await Actor.create(req.body);
  res.status(201).json(actor);
});

router.put('/:id', async (req, res) => {
  const actor = await Actor.findByPk(req.params.id);
  if (!actor) return res.status(404).json({ error: 'Actor not found' });

  await actor.update(req.body);
  res.json(actor);
});

router.delete('/:id', async (req, res) => {
  const actor = await Actor.findByPk(req.params.id);
  if (!actor) return res.status(404).json({ error: 'Actor not found' });

  await actor.destroy();
  res.status(204).send();
});

module.exports = router;
