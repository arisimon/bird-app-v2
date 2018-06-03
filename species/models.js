'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//species schema
const speciesSchema = mongoose.Schema({
    scientific_name: String,
    common_name: String,
    family: String,
})

speciesSchema.methods.serialize = function() {
    return {
        id: this._id,
        scientific_name: this.scientific_name,
        common_name: this.common_name,
        family: this.family,
    };
}

const Species = mongoose.model('Species', speciesSchema, 'species');

module.exports = { Species };