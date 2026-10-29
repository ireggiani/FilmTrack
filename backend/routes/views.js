const express = require('express');
const { UniqueConstraintError } = require('sequelize');
const { sequelize, View } = require('../models');
const router = express.Router();

// Get all views
router.get('/', async (req, res) => {
  const views = await View.findAll();
  res.json(views);
});

// Create a new view
router.post('/', async (req, res) => {
  const view = await View.create(req.body);
  res.status(201).json(view);
});

// Update a view. Starring one (isDefault: true) unstars the rest.
router.put('/:id', async (req, res) => {
  const view = await sequelize.transaction(async (transaction) => {
    const found = await View.findByPk(req.params.id, { transaction });
    if (!found) return null;
    if (req.body.isDefault === true) {
      await View.update({ isDefault: false }, { where: {}, transaction });
    }
    return found.update(req.body, { transaction });
  });
  if (!view) {
    return res.status(404).json({ error: 'View not found' });
  }
  res.json(view);
});

// Delete a view
router.delete('/:id', async (req, res) => {
  const view = await View.findByPk(req.params.id);
  if (!view) {
    return res.status(404).json({ error: 'View not found' });
  }
  await view.destroy();
  res.status(204).send();
});

// Names are unique; report a clash as 409 with a message the UI can show.
// Everything else goes on to the app-wide error handler.
router.use((err, req, res, next) => {
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ error: 'A view with that name already exists' });
  }
  next(err);
});

module.exports = router;
