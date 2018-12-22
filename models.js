'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const logSchema = mongoose.Schema({
  routine: {type: String, required: true},
  user: {type: String},
  lifts: {type: Array},
  notes: {type: String},
  date: {type: Date, default: Date()}
});

logSchema.methods.serialize = function() {
  return {
    id: this._id,
    routine: this.routine,
    user: this.user,
    lifts: this.lifts,
    notes: this.notes,
    date: this.date
  };
};

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.methods.serialize = function() {
  return {
    username: this.username || ''
  };
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const Log = mongoose.model('log', logSchema);

const User = mongoose.model('user', userSchema);

module.exports = { Log, User };