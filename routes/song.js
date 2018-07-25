'use strict';

const express = require('express');
const SongController = require('../controllers/song');
const auth = require('../middlewares/auth');
const multipart = require('connect-multiparty');
const config = require('../config');

const md_upload = multipart({ uploadDir: config.songsUploadDir })
const api = express.Router();

api.get('/song/:id', auth.isAuth, SongController.getSong);
api.post('/song', auth.isAuth, SongController.saveSong);
api.put('/song/:id', auth.isAuth, SongController.updateSong);
api.get('/songs/:id?', auth.isAuth, SongController.getSongs);
api.delete('/song/:id', auth.isAuth, SongController.deleteSong);
api.post('/song/file/:id', [auth.isAuth, md_upload], SongController.uploadFile);
api.get('/song/file/:id', SongController.getFile);

module.exports = api;
