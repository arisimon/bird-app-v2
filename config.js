'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://ari:ari@ds113640.mlab.com:13640/birds'
                      || 'mongodb://localhost/bird-app-v2';
exports.TESTDATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://ari:ari@ds153729.mlab.com:53729/test-birds'
                      || 'mongodb://localhost/test-bird-app-v2';
exports.PORT = process.env.PORT || 8080;
