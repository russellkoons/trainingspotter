'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { Log } = require('./models');

const app = express();

app.use(express.static('public'));
app.use(morgan('common'));
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
    }
  }

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