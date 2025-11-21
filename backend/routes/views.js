const express = require('express');
const { View } = require('../models');
const router = express.Router();

// Get all views
router.get('/', async (req, res) => {
  try {
    const views = await View.findAll();
    res.json(views);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new view
router.post('/', async (req, res) => {
  try {
    const view = await View.create(req.body);
    res.status(201).json(view);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a view
router.put('/:id', async (req, res) => {
  try {
    const view = await View.findByPk(req.params.id);
    if (!view) {
      return res.status(404).json({ error: 'View not found' });
    }
    await view.update(req.body);
    res.json(view);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
