'use strict';

const express = require('express');

const {Log} = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  Log
    .find()
    .then(logs => {
      res.json(logs.map(log => log.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Ya dun goofed' });
    });
});

router.get('/:id', (req, res) => {
  Log
    .findById(req.params.id)
    .then(log => res.json(log.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Dang it!' });
    });
});

router.post('/', (req, res) => {
  const requiredFields = ['routine', 'lifts'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    };
  };
  Log
    .create({
      routine: req.body.routine,
      user: req.body.user,
      lifts: req.body.lifts,
      notes: req.body.notes
    })
    .then(log => res.status(201).json(log.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'uh oh' });
    });
});

router.put('/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and body ids must match'
    });
  };
  const updated = {
    "routine": req.body.routine,
    "notes": req.body.notes
  };
  if (!(req.body.lifts === undefined)) {
    updated.lifts = [];
    for (let i = 0; i < req.body.lifts.length; i++) {
      updated.lifts.push({
        "name": req.body.lifts[i].name,
        "weight": req.body.lifts[i].weight,
        "unit": req.body.lifts[i].unit,
        "sets": req.body.lifts[i].sets,
        "reps": req.body.lifts[i].reps
      });
    };
  };
  Log
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedLog => {
      res.status(204).end()
    })
    .catch(err => res.status(500).json({ message: `Failed to update log ${req.params.id}` }));
});

router.delete('/:id', (req, res) => {
  Log
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleting log ${req.params.id}`);
      res.status(204).json({ message: 'Successful delete'});
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'Delete failed' });
    });
});

module.exports = {router};