'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const { User } = require('./models');
const router = express.Router();
const jsonParser = bodyParser.json();

// Register a new user
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if(missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['username', 'password', 'firstName', 'lastName'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if(nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect Field Type: Expected String',
            location: nonStringField
        });
    }


    const trimmedFields = ['username', 'password'];
    const nonTrimmedField = trimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if(nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end With whitespace',
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {
            min: 1
        },
        password: {
            min: 8,
            max: 72
        }
    };

    const tooSmallField = Object.keys(sizedFields).find(
        field =>
        'min' in sizedFields[field] &&
        req.body[field].trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(
        field =>
        'max' in sizedFields[field] &&
        req.body[field].trim().length > sizedFields[field].max
    );

    if(tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField ?
                `Must be at least ${sizedFields[tooSmallField]
          .min} characters long` : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let { username, password, firstName = '', lastName = '' } = req.body;

    firstName = firstName.trim();
    lastName = lastName.trim();

    return User.find({ username })
        .count()
        .then(count => {
            if(count > 0) {
                //If existing username
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username Already Taken!',
                    location: 'username'
                });
            }
            // If there is no existing user, hash the password
            return User.hashPassword(password);
        })
        .then(hash => {
            return User.create({
                username,
                password: hash,
                firstName,
                lastName
            });
        })
        .then(user => {
            console.log(`New user is ${user}`);
            return res.status(201).json(user);
        })
        .catch(err => {
            if(err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ code: 500, message: err.message });
        });
});


router.get('/', (req, res) => {
    return User.find()
        .then(users => res.json(users.map(user => user)))
        .catch(err => res.status(500).json({ message: 'Internal server error' }));
});


module.exports = { router };