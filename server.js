'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const{ router: usersRouter } = require('./users');
const{ router: logRouter} = require('./logs');
const{ router: authRouter, local, jwt } = require('./auth')

mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');

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
app.use(morgan('common'));
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/logs', logRouter);

passport.use(local);
passport.use(jwt);

const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'pretty sneaky sis'
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
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