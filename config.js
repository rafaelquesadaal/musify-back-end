module.exports = {
    port: process.env.PORT || 3977,
    db: process.env.MONGODB || 'mongodb://localhost:27017/mean-project',
    userUploadDir: './uploads/users',
    artistsUploadDir: './uploads/artists',
    albumsUploadDir: './uploads/albums',
    songsUploadDir: './uploads/songs',
    SECRET_TOKEN: 'secret_password'
};