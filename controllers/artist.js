'use-strict';

const fs = require('fs');
const path = require('path'); 
const Artist = require('../models/artist');
const Song = require('../models/song');
const Album = require('../models/album');
const Image = require('../models/image');
const mongoosePaginate = require('mongoose-pagination');

function getArtist(req, res){
    var artistId = req.params.id;
    Artist.findById(artistId, (err, artist) => {
        if(err) return res.status(500).send({ message: 'Error in the request' }); 
        if(!artist) res.status(404).send({ message: 'The artist does not exist' });
        else res.send({ artist });
    });
};

function getArtists(req, res){
    const page = (req.params.page) ? req.params.page : 1;
    const itemsPerPage = 4;

    Artist.find().sort('name').paginate(page, itemsPerPage, (err, artists, total) => {
        if(err) return res.status(500).send({ message: 'Error in the request' });
        else{
            if(!artists) res.status(404).send({ message: 'There are no artist' });
            else{
                return res.send({
                    itemsPerPage: itemsPerPage,
                    items: total,
                    artists: artists
                });
            }
        }
    });
};

function saveArtist(req, res){
    var artist = new Artist();
    var params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';
    artist.save((err, storedArtist) => {
        if(err) res.status(500).send({ message: 'Error saving the artist' });
        else{
            if(!storedArtist) res.status(404).send({ message: 'The artist was not saved' });
            else res.send({ artist : storedArtist }); 
        }
    });
};

function updateArtist(req, res){
    const artistId = req.params.id;
    const updateArtist = req.body;
    Artist.findByIdAndUpdate(artistId, updateArtist, (err, artistUpdated) => {
        if(err) return res.status(500).send({ message: 'Error updating the artist' });
        else{
            if(!artistUpdated) return res.status(404).send({ message: 'The artist was not updated' });
            else return res.send({ artist : artistUpdated }); 
        }
    });
};

function deleteArtist(req, res){
    const artistId = req.params.id;
    Artist.findByIdAndRemove(artistId, (err, deletedArtist) => {
        if(err) return res.status(500).send({ message: 'Error deleting the artist' });
        else{
            if(!deletedArtist) return res.status(404).send({ message: 'The artist was not deleted' });
            else{
                Album.find({ artist: deleteArtist._id }).remove((err, deletedAlbum) => {
                    if(err) return res.status(500).send({ message: 'Error deleting the albums' });
                    else{
                        if(!deletedAlbum) return res.status(404).send({ message: 'The albums were not deleted' });
                        else{
                            Song.find({ album: deletedAlbum._id }).remove((err, deletedSong) => {
                                if(err) return res.status(500).send({ message: 'Error deleting the songs' });
                                else{
                                    if(!deletedSong) return res.status(404).send({ message: 'The songs were not deleted' });
                                    else{
                                        return res.send({ artist : deletedArtist });
                                    }
                                }
                            });         
                        }
                    }
                });
            }
        }
    });
};

function uploadImage(req, res){
    const artistId = req.params.id;
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
                        Artist.findByIdAndUpdate(artistId, { image: storedImage._id }, (err, updatedArtist) => {
                            if(err) res.status(500).send({ message: 'Error updating the artist' });
                            else{
                                if(!updatedArtist) res.status(404).send({ message: 'Could not update the artist' });
                                else{
                                    //return res.send({ image : storedImage });
                                    Image.findByIdAndRemove(updatedArtist.image, (err, deletedImage) => {
                                        if(err) console.log({ message: 'Error deleting the image'});
                                        else{
                                            if(!deletedImage) console.log({ message: 'The image was not deleted' });
                                            else console.log({ image : deletedImage });
                                        }
                                    });
                                    return res.send({ 
                                        artist: updatedArtist,
                                        image: storedImage._id
                                    });
                                }
                            }
                        });
                    }
                }
            });
        } else res.send({ message: 'Invalid file ext' });

        console.log(fileName);
    } else res.send({ message: 'Image not uploaded' });
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
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImage
};