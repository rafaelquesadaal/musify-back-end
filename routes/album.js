'use strict';

const express = require('express');
const AlbumController = require('../controllers/album');
const auth = require('../middlewares/auth');
const multipart = require('connect-multiparty');
const config = require('../config');

const md_upload = multipart({ uploadDir: config.albumsUploadDir })
const api = express.Router();

api.get('/album/:id', auth.isAuth, AlbumController.getAlbum);
api.get('/albums/:artistId?', auth.isAuth, AlbumController.getAlbums);
api.post('/album', auth.isAuth, AlbumController.saveAlbum);
api.put('/album/:id', auth.isAuth, AlbumController.updateAlbum);
api.delete('/album/:id', auth.isAuth, AlbumController.deleteAlbum);
api.post('/album/file/:id', [auth.isAuth, md_upload], AlbumController.uploadImage);
api.get('/album/file/:id', AlbumController.getImage);

module.exports = api;