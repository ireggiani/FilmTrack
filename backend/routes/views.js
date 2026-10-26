const express = require('express');
const { UniqueConstraintError } = require('sequelize');
const { sequelize, View } = require('../models');
const router = express.Router();

// Names are unique; report a clash as 409 so the UI can say so
const sendError = (res, error) => {
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ error: 'A view with that name already exists' });
  }
  res.status(500).json({ error: error.message });
};

// Get all views
router.get('/', async (req, res) => {
  try {
    const views = await View.findAll();
    res.json(views);
  } catch (error) {
    sendError(res, error);
  }
});

// Create a new view
router.post('/', async (req, res) => {
  try {
    const view = await View.create(req.body);
    res.status(201).json(view);
  } catch (error) {
    sendError(res, error);
  }
});

// Update a view. Starring one (isDefault: true) unstars the rest.
router.put('/:id', async (req, res) => {
  try {
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
  } catch (error) {
    sendError(res, error);
  }
});

// Delete a view
router.delete('/:id', async (req, res) => {
  try {
    const view = await View.findByPk(req.params.id);
    if (!view) {
      return res.status(404).json({ error: 'View not found' });
    }
    await view.destroy();
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
