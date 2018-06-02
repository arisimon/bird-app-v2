'use strict';

const express = require('express');
const config = require('../config');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mongoose = require('mongoose');
const router = express.Router();
const {Observations} = require('./models');


//set up router parsing
router.use(jsonParser);
router.use(bodyParser.urlencoded({ extended: true}));










module.exports = {router};