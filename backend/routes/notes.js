const express = require('express');
const router = express.Router();
const { fn, col } = require('sequelize');
const { Note } = require('../models');

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.findAll({
      // lower() so SQLite doesn't sort all uppercase titles before lowercase ones
      order: [[fn('lower', col('title')), 'ASC']]
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.create({ title, content });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const [updated] = await Note.update(
      { title, content },
      { where: { id: req.params.id } }
    );
    if (updated) {
      const note = await Note.findByPk(req.params.id);
      res.json(note);
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Note.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;