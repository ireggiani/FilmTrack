const express = require('express');
const { validate } = require('../validation/validate');

// The routes every lookup table has (genres, countries, directors, actors):
// list, add, change and delete. `schema` is its { create, update } pair from
// validation/schemas.js and `label` names one item in the 404 message.
function lookupRouter(Model, schema, label) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    res.json(await Model.findAll());
  });

  router.post('/', validate(schema.create), async (req, res) => {
    const item = await Model.create(req.body);
    res.status(201).json(item);
  });

  router.put('/:id', validate(schema.update), async (req, res) => {
    const item = await Model.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: `${label} not found` });

    await item.update(req.body);
    res.json(item);
  });

  router.delete('/:id', async (req, res) => {
    const item = await Model.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: `${label} not found` });

    await item.destroy();
    res.status(204).send();
  });

  return router;
}

module.exports = { lookupRouter };
