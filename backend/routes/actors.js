const express = require('express');
const { Actor } = require('../models');
const { validate } = require('../validation/validate');
const schemas = require('../validation/schemas');
const router = express.Router();

router.get('/', async (req, res) => {
  const actors = await Actor.findAll();
  res.json(actors);
});

router.post('/', validate(schemas.actor.create), async (req, res) => {
  const actor = await Actor.create(req.body);
  res.status(201).json(actor);
});

router.put('/:id', validate(schemas.actor.update), async (req, res) => {
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
