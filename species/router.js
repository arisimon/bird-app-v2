'use strict';

const express = require('express');
const config = require('../config');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded({ extended: true});
const mongoose = require('mongoose');
const router = express.Router();
const {Species} = require('./models');


//set up router parsing
router.use(jsonParser);
router.use(urlParser);



// //GET species based off search input, if not found get all species
// router.get('/', function(req, res, next) {
//     console.log('Received a GET request to find species');
//     console.log(req.query);
//     let noMatch = null;
//     if (req.query.search) {
//         const regex = new RegExp(escapeRegex(req.query.search), 'gi');
//         // Get all species from DB
//         Species.find({ common_name: regex }, function(err, allSpecies) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 if (allSpecies.length < 1) {
//                     noMatch = "No species match that query, please try again.";
//                 }
//                 console.log(allSpecies);
//             }
//         });
//     } else {
//         // Get all species from DB
//         Species.find({}, function(err, allSpecies) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 console.log('This is skipping my query!');
//             }
//         });
//     }
// });


// //GET species by ID
// router.get('/:id', function(req, res, next) {
//     Species
//         .findById(req.params.id)
//         .then(species => {
//             res.json(species);
//         })
//         .catch(err => {
//             console.error(err);
//             res.status(500).json({ message: 'Internal server error' })
//         });
// });

// //function to format query strings
// function escapeRegex(text) {
//     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
// };


module.exports = {router};