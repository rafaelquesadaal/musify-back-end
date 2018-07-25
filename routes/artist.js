'use strict';

const express = require('express');
const ArtistController = require('../controllers/artist');
const auth = require('../middlewares/auth');
const multipart = require('connect-multiparty');
const config = require('../config');

const md_upload = multipart({ uploadDir: config.artistsUploadDir })
const api = express.Router();

api.get('/artist/:id', auth.isAuth, ArtistController.getArtist);
api.get('/artists/:page?', auth.isAuth, ArtistController.getArtists);
api.post('/artist', auth.isAuth, ArtistController.saveArtist);
api.put('/artist/:id', auth.isAuth, ArtistController.updateArtist);
api.delete('/artist/:id', auth.isAuth, ArtistController.deleteArtist);
api.post('/artist/file/:id', [auth.isAuth, md_upload], ArtistController.uploadImage);
api.get('/artist/file/:id', ArtistController.getImage);

module.exports = api;