const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');

const router = express.Router();

const noteRules = (optional) => {
  const field = (name) => (optional ? body(name).optional() : body(name));
  return [
    field('title').isString().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3 to 200 characters'),
    field('description').isString().trim().isLength({ min: 5, max: 10000 }).withMessage('Description must be at least 5 characters'),
    body('tag').optional().isString().trim().isLength({ max: 40 }).withMessage('Tag must be at most 40 characters'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// Loads the note for :id and checks that it belongs to the logged-in user.
const ownNote = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not Found' });
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Not Found' });
    if (note.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not Allowed' });
    req.note = note;
    return next();
  } catch (error) {
    return next(error);
  }
};

const handleError = (res, error) => {
  console.error(error.message);
  res.status(500).json({ error: 'Internal Server Error' });
};

// ROUTE 1: Get all notes: GET /api/notes/fetchnotes. Login required.
router.get('/fetchnotes', fetchuser, async (req, res) => {
  try {
    res.json(await Note.find({ user: req.user.id }).sort({ date: -1 }));
  } catch (error) {
    handleError(res, error);
  }
});

// ROUTE 2: Add a note: POST /api/notes/createnote. Login required.
router.post('/createnote', fetchuser, noteRules(false), validate, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const note = await Note.create({ title, description, tag: tag || undefined, user: req.user.id });
    res.json(note);
  } catch (error) {
    handleError(res, error);
  }
});

// ROUTE 3: Update a note: PUT /api/notes/updatenote/:id. Login required.
router.put('/updatenote/:id', fetchuser, noteRules(true), validate, ownNote, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    if (title !== undefined) req.note.title = title;
    if (description !== undefined) req.note.description = description;
    if (tag !== undefined) req.note.tag = tag || 'General';
    const note = await req.note.save();
    res.json({ note });
  } catch (error) {
    handleError(res, error);
  }
});

// ROUTE 4: Delete a note: DELETE /api/notes/deletenote/:id. Login required.
router.delete('/deletenote/:id', fetchuser, ownNote, async (req, res) => {
  try {
    await req.note.deleteOne();
    res.json({ Success: 'Note has been deleted', note: req.note });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
