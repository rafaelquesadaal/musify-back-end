'use strict';

const express = require('express');
const UserController = require('../controllers/user');
const auth = require('../middlewares/auth');
const multipart = require('connect-multiparty');
const config = require('../config');

const md_upload = multipart({ uploadDir: config.userUploadDir })
const api = express.Router();

api.get('/test-controller', auth.isAuth, UserController.test);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.login);
api.put('/user/:id', auth.isAuth, UserController.updateUser);
api.post('/user/file/:id', [auth.isAuth, md_upload], UserController.uploadImage);
api.get('/user/file/:id', UserController.getImage);

module.exports = api;