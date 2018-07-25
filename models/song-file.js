'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SongFileSchema = Schema({
    extension: String,
    type: String,
    file: Buffer
});

module.exports = mongoose.model('SongFile', SongFileSchema);