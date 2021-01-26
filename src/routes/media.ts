import express from 'express';
import fs from 'fs';
import {files} from "../../config";
import multer from 'multer';
import Media from "../models/Media";
import crypto from 'crypto';
import {imageSize} from "image-size";
import ffmpeg from 'fluent-ffmpeg';
import {promisify} from "util";

fs.access(files.fileDirectory, fs.constants.W_OK, function(err) {
    if(err) {
        console.error(err);
        process.exit(err.errno);
    }
})
fs.mkdir(`${files.fileDirectory}/in`, (err)=>{
    if(err && err.code !== 'EEXIST') {
        console.error(err);
        process.exit(err.errno);
    }
});
fs.mkdir(`${files.fileDirectory}/storage`, (err)=>{
    if(err && err.code !== 'EEXIST') {
        console.error(err);
        process.exit(err.errno);
    }
});

const upload = multer({dest: `${files.fileDirectory}/in/`});

const router = express.Router();

const imageTypes = ['image/jpeg', 'image/png', 'image/gif'];
const videoTypes = ['video/x-matroska'];
const allowedMimeTypes = imageTypes.concat(videoTypes);

router.post('/upload', upload.single('file'), async function(req, res) {
    if(!allowedMimeTypes.includes(req.file.mimetype)) {
        console.log(req.file.mimetype);
        fs.unlink(req.file.path, (err) => {
            if(err) {
                console.error(err);
            }
        });
        return res.status(400).send({message: `File can only be one of the following types: ${JSON.stringify(allowedMimeTypes)}`})
    }

    let width = 0;
    let height = 0;
    let duration = 0;

    try {
        if(imageTypes.includes(req.file.mimetype)) {
            const dimensions = imageSize(req.file.path);
            width = dimensions.width;
            height = dimensions.height;
        }
        else {
            const metadata = await promisify(ffmpeg.ffprobe)(req.file.path);
            width = metadata.streams[0].width;
            height = metadata.streams[0].height;
            duration = Math.floor(metadata.format.duration);
        }
    }
    catch(err) {
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }

    const readStream = fs.createReadStream(req.file.path);
    const hash = crypto.createHash('sha1');
    hash.setEncoding('hex');
    readStream.on('end', async function() {
        hash.end();

        const hashCode = hash.read();

        try {
            await fs.promises.rename(req.file.path, `${files.fileDirectory}/storage/${hashCode}`);

            const media = await Media.create({
                hash: hashCode,
                mediaType: req.file.mimetype,
                width,
                height,
                duration,
                size: req.file.size
            });
            res.status(200).send(media);
        }
        catch(err) {
            return res.status(500).send({message: 'An error has occurred on the server.'});
        }

        console.log(`${files.fileDirectory}/storage/${hashCode}`)
        ffmpeg(`${files.fileDirectory}/storage/${hashCode}`)
            .screenshots({
                folder: `${files.fileDirectory}/storage`,
                filename: `${hashCode}.thumbnail.png`,
                timestamps: ['50%'],
                size: '192x192'
            });

    })
    readStream.pipe(hash);
});

export default router;
