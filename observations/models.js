'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const observationSchema = mongoose.Schema({
	user: {type: String},
	name: {type: String},
	scientificName: {type: String},
	commonName: {type: String},
	familyName: {type: String},
	location: {type: String},
	notes: {type: String},
	photos: {type: String},
	obsDate: { type: Date, default: Date.now }
})

observationSchema.methods.serialize = function() {
    const obsDateObj = new Date(this.obsDate);
    return {
        id: this._id,
        scientificName: this.scientificName,
        commonName: this.commonName,
        familyName: this.familyName,
        location: this.location,
        notes: this.notes,
        photos: this.photos,
        obsDate: obsDateObj,
    };
}

const Observations = mongoose.model(observationSchema, 'observations');

module.exports = {Observations};