'use strict';

const {router} = require('./router');
const {local, jwt} = require('./strategies');

module.exports = {router, local, jwt};