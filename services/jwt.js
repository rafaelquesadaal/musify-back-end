'use-strict';

var jwt = require('jwt-simple');
var moment = require('moment');
const config = require('../config');

function createToken(user){
    const payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    };

    return jwt.encode(payload, config.SECRET_TOKEN);
};

module.exports = {
    createToken
};