const express = require('express');
const router = express.Router();
const { fn, col } = require('sequelize');
const { Note } = require('../models');

// Get all notes
router.get('/', async (req, res) => {
  const notes = await Note.findAll({
    // lower() so SQLite doesn't sort all uppercase titles before lowercase ones
    order: [[fn('lower', col('title')), 'ASC']]
  });
  res.json(notes);
});

// Create new note
router.post('/', async (req, res) => {
  const { title, content } = req.body;
  const note = await Note.create({ title, content });
  res.status(201).json(note);
});

// Update note
router.put('/:id', async (req, res) => {
  const { title, content } = req.body;
  const [updated] = await Note.update(
    { title, content },
    { where: { id: req.params.id } }
  );
  if (!updated) return res.status(404).json({ error: 'Note not found' });

  const note = await Note.findByPk(req.params.id);
  res.json(note);
});

// Delete note
router.delete('/:id', async (req, res) => {
  const deleted = await Note.destroy({
    where: { id: req.params.id }
  });
  if (!deleted) return res.status(404).json({ error: 'Note not found' });

  res.status(204).send();
});

module.exports = router;
