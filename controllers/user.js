'use strict';

const User = require('../models/user');
const Image = require('../models/image');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path'); 

function test(req, res){
    res.send({
        message: 'Testing controller'
    });
};

function saveUser(req, res){
    var user = new User();
    var params = req.body;
    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.image = 'null';

    if(params.password){
        bcrypt.hash(params.password, null, null, (err, hash) => {
            user.password = hash;
            if(user.name != null && user.surname != null && user.email != null){
                user.save((err, storedUser) => {
                    if(err) res.status(500).send({ message: 'Error saving the user' });
                    else{
                        if(!storedUser) res.status(404).send({ message: 'The user was not saved' });
                        else res.send({ user : storedUser });
                    }
                });
            } else{
                res.send({ message: 'Complete all fields' });
            }
        });
    } else {
        res.send({ message: 'The password is required' });
    }
};

function login(req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if(err) res.status(500).send({ message: 'Error in the request' });
        else{
            if(!user) res.status(404).send({ message: 'User not found' });
            else{
                bcrypt.compare(password, user.password, (err, check) => {
                    if(check){
                        if(params.gethash){
                            res.send({
                                token: jwt.createToken(user) 
                            });
                        } else {
                            res.send({ user });
                        }
                    } else {
                        res.status(404).send({ message: 'User could not be logged' });
                    }
                });
            }
        }
    });
};

function updateUser(req, res){
    const userId = req.params.id;
    const updateUser = req.body;
    if(userId != req.user.sub) return res.status(500).send({ message: 'You do not have permission to update the user' });
    User.findByIdAndUpdate(userId, updateUser, (err, userUpdated) => {
        if(err) return res.status(500).send({ message: 'Error updating the user' });
        else{
            if(!userUpdated) return res.status(404).send({ message: 'Could not update the user' });
            else return res.send({ user: userUpdated });
        }
    });
};

function uploadImage(req, res){
    const userId = req.params.id;
    if(req.files){
        const filePath = req.files.image.path;
        const fileName = filePath.split('\\').pop();
        const originalName = req.files.image.name;
        const fileExt = fileName.split('\.').pop();

        if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'gif' || fileExt == 'jpeg' ){
            var newImage = new Image();
            newImage.title = fileName;
            newImage.originalTitle = originalName;
            newImage.extension = fileExt;
            newImage.type = req.files.image.type;
            newImage.file = fs.readFileSync(filePath);
            newImage.save((err, storedImage) => {
                if(err) return res.status(500).send({ message: 'Error saving the image' });
                else{
                    if(!storedImage) return res.status(404).send({ message: 'The image was not saved' });
                    else {
                        fs.unlink(filePath);
                        User.findByIdAndUpdate(userId, { image: storedImage._id }, (err, updatedUser) => {
                            if(err) res.status(500).send({ message: 'Error updating the user' });
                            else{
                                if(!updatedUser) res.status(404).send({ message: 'Could not update the user' });
                                else {
                                    Image.findByIdAndRemove(updatedUser.image, (err, deletedImage) => {
                                        if(err) console.log({ message: 'Error deleting the image'});
                                        else{
                                            if(!deletedImage) console.log({ message: 'The image was not deleted' });
                                            else console.log({ image : deletedImage });
                                        }
                                    });

                                    return res.send({ 
                                        user: updatedUser,
                                        image: storedImage._id
                                    });
                                }
                            }
                        });
                    }
                }
            });
        } else res.status(404).send({ message: 'Invalid file ext' });
    } else res.status(404).send({ message: 'Image not uploaded' });
};

function getImage(req, res){
    var imageId = req.params.id;
    Image.findById(imageId, (err, image) => {
        if(err) return res.status(500).send({ message: 'Error in the request' });
        else {
            if(!image) res.status(404).send({ message: 'The image does not exist' });
            else {
                res.contentType(image.type);
                res.send(image.file);
            }
        }
    });
}

module.exports = {
    test,
    saveUser,
    login,
    updateUser,
    uploadImage,
    getImage
};