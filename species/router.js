'use strict';

const express = require('express');
const config = require('../config');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded({ extended: true});
const mongoose = require('mongoose');
const router = express.Router();
const {Species} = require('./models');
const passport = require('passport');


//set up router parsing
router.use(jsonParser);
router.use(urlParser);

//Authentication
const {localStrategy, jwtStrategy } = require('../auth/strategies');

passport.use('local', localStrategy);
passport.use(jwtStrategy);


//GET request for all species
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log('GETting all species')
	 Species
        .find()
        .exec()
        .then(species => {
            res.status(200).json(species)
        })
        .catch(err => {
            res.status(500).json({ message: 'Internal server error' });
        })
})



// //function to format query strings
// function escapeRegex(text) {
//     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
// };
// //GET species based off search input, if not found get all species
// router.get('/', passport.authenticate('jwt', {session: false}), function(req, res, next) {
//     console.log('Received a GET request to find species');
//     console.log(req.query);
//     let noMatch = null;
//     if (req.query.search) {
//         const regex = new RegExp(escapeRegex(req.query.search), 'gi');
//         Species.find({ common_name: regex }, function(err, allSpecies) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 if (allSpecies.length < 1) {
//                     noMatch = "No species match that query, please try again.";
//                 }
//                 res.status(200).json(species)
//             }
//         });
//     } else {
//         // Get all species from DB
//         Species
//         .find()
//         .exec()
//         .then(species => {
//             res.status(200).json(species)
//         })
//         .catch(err => {
//             res.status(500).json({ message: 'Internal server error' });
//         })
//     }
// });



//GET request by ID
router.get('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log(`GETting species with ID: ${req.param.id}`);
    Species
        .findById(req.params.id)
        .exec()
        .then(species => res.status(200).json(species))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' })
        })
});




module.exports = {router};