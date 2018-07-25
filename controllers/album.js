'use-strict';

const fs = require('fs');
const path = require('path');
const mongoosePaginate = require('mongoose-pagination');
const config = require('../config');

const Song = require('../models/song');
const Album = require('../models/album');
const Image = require('../models/image');

function getAlbum(req, res){
    var albumId = req.params.id;
    Album.findById(albumId).populate({ path: 'artist' }).exec((err, album) => {
        if(err) return res.status(500).send({ message: 'Error in the request' });
        else {
            if(!album) res.status(404).send({ message: 'The album does not exist' });
            else res.send({ album });
        }
    });
};

function getAlbums(req, res){
    const page = (req.query.page) ? req.query.page : 1;
    const itemsPerPage = 4;
    const artistId = req.params.artistId;

    if(!artistId){
        var find = Album.find({}).sort('title').paginate(page, itemsPerPage);
    } else {
        var find = Album.find({ artist: artistId }).sort('year').paginate(page, itemsPerPage);
    }

    find.populate({ path: 'artist' }).paginate(page, itemsPerPage, (err, albums, total) => {
        if(err) return res.status(500).send({ message: 'Error in the request' });
        else {
            if(!albums) res.status(404).send({ message: 'There are no albums' });
            else res.send({
                itemsPerPage: itemsPerPage,
                items: total,
                albums: albums
            });
        }
    });
};

function updateAlbum(req, res){
    const albumId = req.params.id;
    const params = req.body;
    Album.findByIdAndUpdate(albumId, params, (err, updatedAlbum) => {
        if(err) return res.status(500).send({ message: 'Error in the request' });
        else {
            if(!updatedAlbum) return res.status(404).send({ message: 'The album could not be updated because the album does not exist' });
            else return res.send({ album: updatedAlbum });
        }
    });
};

function deleteAlbum(req, res){
    const albumId = req.params.id;
    Album.findByIdAndRemove(albumId, (err, deletedAlbum) => {
        if(err) return res.status(500).send({ message: 'Error deleting the albums' });
        else{
            if(!deletedAlbum) return res.status(404).send({ message: 'The albums were not deleted' });
            else{
                Song.find({ album: deletedAlbum._id }).remove((err, deletedSong) => {
                    if(err) return res.status(500).send({ message: 'Error deleting the songs' });
                    else{
                        if(!deletedSong) return res.status(404).send({ message: 'The songs were not deleted' });
                        else{
                            return res.send({ album : deletedAlbum });
                        }
                    }
                });         
            }
        }
    });
};

function saveAlbum(req, res){
    var album = new Album();
    const params = req.body;
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;

    album.save((err, storedAlbum) => {
        if(err) res.status(500).send({ message: 'Error saving the album' });
        else{
            if(!storedAlbum) res.status(404).send({ message: 'The album was not saved' });
            else res.send({ album : storedAlbum }); 
        }
    });
}

function uploadImage(req, res){
    const albumId = req.params.id;
    if(req.files){
        const filePath = req.files.image.path;
        const fileName = filePath.split('\\').pop();
        const originalName = req.files.image.name;
        const fileExt = fileName.split('\.').pop();

        if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'gif' ){
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
                        Album.findByIdAndUpdate(albumId, { image: storedImage._id }, (err, updatedAlbum) => {
                            if(err) res.status(500).send({ message: 'Error updating the album' });
                            else{
                                if(!updatedAlbum) res.status(404).send({ message: 'Could not update the album' });
                                else {
                                    //return res.send({ image : storedImage });
                                    Image.findByIdAndRemove(updatedAlbum.image, (err, deletedImage) => {
                                        if(err) console.log({ message: 'Error deleting the image'});
                                        else{
                                            if(!deletedImage) console.log({ message: 'The image was not deleted' });
                                            else console.log({ image : deletedImage });
                                        }
                                    });
                                    return res.send({ 
                                        album: updatedAlbum,
                                        image: storedImage._id
                                    });
                                }
                            }
                        });
                    }
                }
            });
        } else res.send({ message: 'Invalid file ext' });

    } else res.send({ message: 'Image not uploaded' });
};

function getImage(req, res){
    /*var imageName = req.params.imageName;
    const imagePath = `${config.albumsUploadDir}/${imageName}`; 
    fs.exists(imagePath, (exists) => {
        if(exists){
            res.sendFile(path.resolve(imagePath));
        } else res.send({ message: 'Image does not exists' });
    });*/

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
};

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImage
};