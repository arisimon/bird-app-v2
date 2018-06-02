'use strict';

const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const jwt = require('jsonwebtoken');
const config = require('../config');
const router = express.Router();

//import URLs for DB
// const {DATABASE_URL, PORT} = require('../config.js');
// mongoose.connect(DATABASE_URL);
// mongoose.Promise = global.Promise;
router.use(jsonParser);
router.use(bodyParser.urlencoded({ extended: true }));

const createAuthToken = function(user) {
    return jwt.sign({ user }, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const localAuth = passport.authenticate('local', { session: false });



router.post('/login', localAuth, (req, res) => {
    //something in Passport authenticate attaches additional ability (like "user") onto request object (could not have called this "blah")
    const authToken = createAuthToken(req.user.serialize());
    res.json({ authToken });
});

const jwtAuth = passport.authenticate('jwt', { session: false });

//refresh expired token
router.post('/refresh', jwtAuth, (req, res) => {
    const authToken = createAuthToken(req.user);
    res.json({ authToken });
});



module.exports = { router };