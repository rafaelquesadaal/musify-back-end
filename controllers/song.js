'use-strict';

const fs = require('fs');
const path = require('path');
const mongoosePaginate = require('mongoose-pagination');
const config = require('../config');

const Song = require('../models/song');
const SongFile = require('../models/song-file');


function getSong(req, res){
    const songId = req.params.id;

    Song.findById(songId).populate({path: 'album'}).exec((err, song) => {
        if(err) return res.status(500).send({ message: 'Error in the request' });
        else{
            if(!song) return res.status(404).send({ message: 'The song does not exist' });
            else return res.send({song});
        }
    });
}

function getSongs(req, res){
    const albumId = req.params.id;
    if(!albumId){
        var find = Song.find().sort('number');
    } else{
        var find = Song.find({ album: albumId }).sort('number');
    }
    find.populate({ 
        path: 'album',
        populate: { 
            path: 'artist'
        }
    }).exec((err, songs) => {
        if(err) return res.status(500).send({ message: 'Error in the request' });
        else{
            if(!songs) return res.status(404).send({ message: 'There are no songs' });
            else return res.send({songs});
        }
    });

};

function updateSong(req, res){
    const songId = req.params.id;
    const params = req.body;

    Song.findByIdAndUpdate(songId, params, (err, updatedSong) => {
        if(err) return res.status(500).send({ message: 'Error in the request' });
        else{
            if(!updatedSong) return res.status(404).send({ message: 'The song was not updated' });
            else return res.send({ song: updatedSong });
        }
    });
};

function deleteSong(req, res){
    const songId = req.params.id;

    Song.findByIdAndRemove(songId, (err, deletedSong) => {
        if(err) return res.status(500).send({ message: 'Error in the request' });
        else{
            if(!deletedSong) return res.status(404).send({ message: 'The song was not deleted' });
            else return res.send({ song: deletedSong });
        }
    });
};

function saveSong(req, res){
    var song = new Song();
    const params = req.body;
    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = 'null';
    song.album = params.album;

    song.save((err, storedSong) => {
        if(err) return res.status(500).send({ message: `Error in the request` });
        else {
            if(!storedSong) return res.status(404).send({ message: 'The song was not saved' });
            else return res.send({ song: storedSong });
        }
    });
};

function uploadFile(req, res){
    const songId = req.params.id;
    if(req.files){
        const filePath = req.files.song.path;
        const fileName = filePath.split('\\').pop();
        const originalName = req.files.song.name;
        const fileExt = fileName.split('\.').pop();

        if(fileExt == 'mp3' || fileExt == 'ogg' || fileExt == 'mpeg' ){
            var songFile = new SongFile();
            songFile.extension = fileExt;
            songFile.type = req.files.song.type;
            songFile.file = fs.readFileSync(filePath);
            songFile.save((err, storedSongFile) => {
                if(err) return res.status(500).send({ message: 'Error saving the song' });
                else{
                    if(!storedSongFile) return res.status(404).send({ message: 'The song was not saved' });
                    else{
                        fs.unlink(filePath);
                        Song.findByIdAndUpdate(songId, { file: storedSongFile._id }, (err, updatedSong) => {
                            if(err) res.status(500).send({ message: 'Error updating the song' });
                            else{
                                if(!updatedSong) res.status(404).send({ message: 'Could not update the song' });
                                else{
                                    SongFile.findByIdAndRemove(updatedSong.file, (err, deletedSongFile) => {
                                        if(err) console.log({ message: 'Error deleting the song file'});
                                        else{
                                            if(!deletedImage) console.log({ message: 'The song file was not deleted' });
                                            else console.log({ songFile : deletedSongFile });
                                        }
                                    });
                                    return res.send({ 
                                        song: updatedSong,
                                        songFile: storedSongFile._id
                                    });
                                }
                            }
                        });
                    }
                }
            }); 
        } else res.send({ message: 'Invalid file ext' });
    } else res.send({ message: 'Song not uploaded' });
};

function getFile(req, res){
    var songId = req.params.id;
    SongFile.findById(songId, (err, song) => {
        if(err) return res.status(500).send({ message: 'Error in the request' });
        else {
            if(!song) res.status(404).send({ message: 'The song file does not exist' });
            else {
                res.contentType(song.type);
                res.send(song.file);
            }
        }
    });
};

module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getFile
}