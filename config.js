'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://ari:ari@ds153729.mlab.com:53729/test-birds' ||
    'mongodb://localhost/bird-app-v2';

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-bird-app-v2';

exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = process.env.JWT_SECRET || 'secret';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';