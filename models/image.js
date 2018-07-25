'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = Schema({
    title: String,
    originalTitle: String, 
    extension: String,
    type: String,
    file: Buffer
});

module.exports = mongoose.model('Image', ImageSchema);