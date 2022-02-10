var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    acronym: {
        type: String,
        required: true,
        unique: true
    },
    definition: {
        type: String,
        default: ''
    }
});

var acronym = new mongoose.model('Acronym', schema);

module.exports = acronym;