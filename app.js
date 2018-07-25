'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Routes
const user_routes = require('./routes/user');
const artist_routes = require('./routes/artist');
const album_routes = require('./routes/album');
const song_routes = require('./routes/song');


// Configuring body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Configuring http headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');
    next(); 
});

// Base routes
app.use('/api', user_routes);
app.use('/api', artist_routes);
app.use('/api', album_routes);
app.use('/api', song_routes);

app.get('/test', (req, res) => {
    res.send('Welcome to mean project');
});

module.exports = app;
