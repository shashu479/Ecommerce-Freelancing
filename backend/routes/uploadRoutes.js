const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');

// Mongo URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/siraba_organic';

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads' // collection name
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });

// @route POST /api/upload
// @desc  Uploads file to DB
router.post('/', upload.single('image'), (req, res) => {
    // Return relative URL that points to our serve route
    res.send(`/api/upload/${req.file.filename}`);
});

// @route GET /api/upload/:filename
// @desc  Display image file
router.get('/:filename', async (req, res) => {
    try {
        const file = await mongoose.connection.db.collection('uploads.files').findOne({ filename: req.params.filename });

        if (!file) {
            return res.status(404).json({ err: 'No file exists' });
        }

        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/jpg' || file.contentType === 'image/webp') {
            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                bucketName: 'uploads'
            });
            const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
            downloadStream.pipe(res);
        } else {
            res.status(404).json({ err: 'Not an image' });
        }
    } catch (error) {
        console.error(error);
        res.status(404).json({ err: 'No file exists' });
    }
});

module.exports = router;
