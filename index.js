'use strict';

var mongoose = require('mongoose');
var app = require('./app');
const config = require('./config');

mongoose.connect(config.db, (err, res) => {
    if(err) throw err;
    else {
        console.log('DB connected correctly...');
        app.listen(config.port, _ => {
            console.log(`Listening on port: ${config.port}`);
        });
    }
});