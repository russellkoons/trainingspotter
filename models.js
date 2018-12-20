'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const logSchema = mongoose.Schema({
  routine: {type: String, required: true},
  user: {type: String},
  lifts: {type: Array, required: true},
  notes: {type: String},
  date: {type: Date, default: Date.now}
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

const Log = mongoose.model('log', logSchema);

module.exports = {Log};