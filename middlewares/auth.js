'use-strict';

var jwt = require('jwt-simple');
var moment = require('moment');
const config = require('../config');

function isAuth(req, res, next){
    if(!req.headers.authorization) return res.status(403).send({ message: 'Do not have authorization' });
    var token = req.headers.authorization.replace(/['"]+/g, '');
    try {
        var payload = jwt.decode(token, config.SECRET_TOKEN);
        if(payload.exp <= moment().unix()) return res.status(401).send({ message: 'Expired token' });

    } catch (error) {
        return res.status(404).send({ message: 'Invalid token' });
    }

    req.user = payload;
    next();
};

module.exports = {
    isAuth
};