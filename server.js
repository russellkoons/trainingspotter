'use strict';

require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { Log } = require('./models');

const app = express();

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Origin', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Origin', 'GET,POST,PUT,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  };
  next();
});

app.use(express.static('public'));
app.use(express.json());


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/logs', (req, res) => {
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

app.get('/logs/:id', (req, res) => {
  Log
    .findById(req.params.id)
    .then(log => res.json(log.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Dang it!' });
    });
});

app.post('/logs', (req, res) => {
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

app.put('/logs/:id', (req, res) => {
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

app.delete('/logs/:id', (req, res) => {
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

app.use('*', (req, res) => {
  return res.status(404).json({ message: "Page not found" });
});

let server;

function runServer(databaseUrl,  port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useNewUrlParser: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`App listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };