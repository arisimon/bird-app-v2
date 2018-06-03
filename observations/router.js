'use strict';

const express = require('express');
const config = require('../config');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded({ extended: true });
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();
const { Observations } = require('./models');


//set up router parsing
router.use(jsonParser);
router.use(urlParser);


//Authentication
const { localStrategy, jwtStrategy } = require('../auth/strategies');

passport.use('local', localStrategy);
passport.use(jwtStrategy);

//GET routes
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('GETting all observations');
    Observations
        .find()
        .exec()
        .then(observations => {
            res.status(200).json(observations)
        })
        .catch(err => {
            res.status(500).json({ message: 'Internal server error' });
        })
});

router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Observations
        .findById(req.params.id)
        .exec()
        .then(observations => res.status(200).json(observations))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' })
        })
});


router.get('/user/:user', passport.authenticate('jwt', { session: false }), (req, res) => {
    Observations
        .find({ user: `${req.params.user}` })
        .exec()
        .then(observations => {
            res.status(200).json(observations)
        })
        .catch(err => {
            res.status(500).json({ message: 'Internal server error' });
        })
});


//POST route
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('POSTing a new observation');
    console.log(req.body);

    //check required fields
    const requiredFields = ['commonName', 'location', 'notes'];
    for(let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if(!(field in req.body)) {
            const message = `Missing field ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    };

    Observations
        .create({
            user: req.body.user,
            scientificName: req.body.scientificName,
            commonName: req.body.commonName,
            familyName: req.body.familyName,
            location: req.body.location,
            notes: req.body.notes,
            photos: req.body.photos,
        })
        .then(observations => res.status(201).json(observations.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).message('Internal server error');
        });
});


//PUT route
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log(`Updating observation ${req.params.id}`);

    const toUpdate = {};
    const updateableFields = ['scientificName', 'commonName', 'familyName', 'location', 'notes', 'photos'];
    updateableFields.forEach((field) => {
        if(field in req.body) {
            toUpdate[field] = req.body[field];
        } else {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    })
    Observations
        .findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
        .then(updatedObservation => res.json(updatedObservation).status(204).end())
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        });
});


//DELETE route
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Observations
        .findByIdAndRemove(req.params.id)
        .then(observations => res.json({ data: req.params.id }).status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal server error' }));
});



module.exports = { router };