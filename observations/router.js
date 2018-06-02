'use strict';

const express = require('express');
const config = require('../config');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded({ extended: true});
const mongoose = require('mongoose');
const router = express.Router();
const {Observations} = require('./models');


//set up router parsing
router.use(jsonParser);
router.use(urlParser);


//GET routes
router.get('/', (req, res) => {
	Observations
		.find()
		.exec()
		.then(observations => {
			res.status(200).json(observations)
		})
		.catch(err => {
			res.status(500).json({message: 'Internal server error'});
		})
});

router.get('/:id', (req, res) => {
	Observations
		.findById(req.params.id)
		.exec()
		.then(observations => res.status(200).json(observations))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'})
		})
});


// router.get('/user/:user', passport.authenticate('jwt', {session: false}), (req, res) => {
// 	Garden
// 		.find({user: `${req.params.user}`})
// 		.exec()
// 		.then(plants => {
// 			res.status(200).json(plants)
// 		})
// 		.catch(err => {
// 			res.status(500).json({message: 'Internal server error'});
// 		})
// });
// 

//POST route
router.post('/', (req, res) => {

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
            title: req.body.title,
            content: req.body.content,
            image: req.body.image
        })
        .then(observations => res.status(201).json(post.serialize()))
        .catch(err=> {
            console.error(err);
            res.status(500).message("Internal server error");
        });
});

router.use('*', (req, res) => {
	res.status(404).send('URL Not Found');
});


//PUT route


//DELETE route
router.delete('/:id', (req, res) => {
    Observations
        .findByIdAndRemove(req.params.id)
        .then(observations => res.json({data: req.params.id}).status(204).end())
        .catch(err =>res.status(500).json({message: "Internal server error"}));
});



module.exports = {router};