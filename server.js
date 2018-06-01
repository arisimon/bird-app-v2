'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const fs = require('fs');
const path = require('path');

//import configuration files
const {PORT, DATABASE_URL } = require('./config');

//Import the mongoose module
const mongoose = require('mongoose');
//Set up default mongoose connection
const mongoDB = 'mongodb://ari:ari@ds113640.mlab.com:13640/birds';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


//create the express application
const app = express();

//set bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//enable CORS
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
	if (req.method === 'OPTIONS') {
		return res.send(204);
	}
	next();
});


// set morgan to log only 4xx and 5xx responses to console
app.use(logger('dev', {
  skip: function (req, res) { return res.statusCode < 400 }
}))

// set morgan to log all requests to access.log
app.use(logger('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
}))

//serve static assets
app.use(express.static('public'));


let server;

//run server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(DATABASE_URL, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Your server is running on ${port}`);
				resolve();
			})
				.on('error', err => {
					mongoose.disconnect();
					reject(err);
				});
		});
	});
}

// close server, return promise
function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
};

//if server is called directly
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer }; 