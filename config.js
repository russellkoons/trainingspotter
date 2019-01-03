'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://admin:Rk79963!@ds139934.mlab.com:39934/trainingspotter';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://admin:Rk79963!@ds139934.mlab.com:39934/trainingspotter';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';