const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {Observations} = require();
const {Species} = require();
const {app, runServer, closeServer} = require('../server');
// const {JWT_EXPIRY, JWT_SECRET, TEST_DATABASE_URL} = require('../config');

// const should = chai.should();
const expect = chai.expect();

chai.use(chaiHttp);