import fs from "fs";
import {imageSize} from "image-size";
import {promisify} from "util";
import crypto from "crypto";
import {files as filesConfig, files} from "../../config";
import Media from "../models/Media";
import ffmpeg from 'fluent-ffmpeg';
import {Request, Response} from "express";
import Joi, {ValidationError} from 'joi';
import Tag from "../models/Tag";
import sequelize, {Op} from 'sequelize';
import TagMediaMapping from "../models/TagMediaMapping";
import sharp from "sharp";

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

export const uploadMedia = async function(req, res) {
    if(!(req.file.mimetype.startsWith('video/') || req.file.mimetype.startsWith('image/'))) {
        console.log(req.file.mimetype);
        fs.unlink(req.file.path, (err) => {
            if(err) {
                console.error(err);
            }
        });
        return res.status(400).send({message: 'File can only be an image of video type'})
    }

    let width = 0;
    let height = 0;
    let duration = 0;

    try {
        if(req.file.mimetype.startsWith('image/')) {
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
        console.error(err);
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

        if(duration) {
            ffmpeg(`${files.fileDirectory}/storage/${hashCode}`)
                .screenshots({
                    folder: `${files.fileDirectory}/storage`,
                    filename: `${hashCode}.thumbnail.png`,
                    timestamps: ['50%'],
                    size: '192x192'
                });
        }
        else {
            sharp(`${files.fileDirectory}/storage/${hashCode}`)
                .resize(192, 192)
                .toFile(`${files.fileDirectory}/storage/${hashCode}.thumbnail.png`)
        }

    })
    readStream.pipe(hash);
}

export const list = async function (req: Request, res: Response) {
    const schema = Joi.object({
        tags: Joi.array()
            .items(Joi.number().positive().integer())
            .min(0),
        after: Joi.number()
            .min(0)
            .integer()
    });

    try {
        const {tags: tagIds, after}: {tags: number[], after: number} = await schema.validateAsync(req.body);
        if(tagIds.length) {
            const mappedTagIds = tagIds.map((i: number) => {
                return {tagId: i};
            })

            const mapping = await TagMediaMapping.findAll({
                where: {
                    [Op.or]: mappedTagIds,
                    mediaId: {
                        [Op.gt]: after
                    }
                },
                group: ['mediaId'],
                having: sequelize.where(sequelize.fn('COUNT', '*'),
                    sequelize.literal(`${tagIds.length}`)
                ),
                limit: 101
            });

            const result = {
                media: mapping.slice(0, 100).map(m => m.media),
                hasNext: mapping.length === 101
            }

            return res.status(200).send(result);
        }

        const media = await Media.findAll({
            where: {
                id: {
                    [Op.gt]: after
                }
            },
            limit: 101
        });

        const result = {
            media: media.slice(0, 100),
            hasNext: media.length === 101
        }

        return res.status(200).send(result);

    }
    catch(err) {
        if (err.isJoi) {
            return res.status(400).send({message: (err as ValidationError).message});
        }
        console.error(err);
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }
}

export const download = async function (req: Request, res: Response) {
    const schema = Joi.object({
        hash: Joi.string()
            .hex()
            .min(5)
            .max(40)
            .required(),
        thumbnail: Joi.boolean()
            .optional(),
        '0': Joi.string()
            .allow('mp4', 'png')
            .required()
    });

    try {
        const {hash, thumbnail}: {hash: string, thumbnail: boolean | undefined} = await schema.validateAsync(req.params);
        const path = `${filesConfig.fileDirectory}/storage/${hash}${thumbnail ? '.thumbnail.png' : ''}`;
        const stat = await fs.promises.stat(path);

        if(thumbnail) {
            return res.status(200).sendFile(path);
        }

        const media = await Media.findOne({
            where: {
                hash
            }
        });
        if(!media) {
            return res.status(404).send({message: 'No media found with that hash'});
        }

        if(media.mediaType.startsWith('video')) {
            const rangeHeader = req.headers.range;
            if(!rangeHeader) {
                return res.status(200).sendFile(path);
            }

            let range;
            if(!rangeHeader.startsWith('bytes=')) {
                range = [0, 65536];
            }
            else {
                range = rangeHeader.substring(6).split('-').map(x => parseInt(x));
            }

            const start = range[0];
            const total = stat.size;
            let end = range[1] ? parseInt(range[1], 10) : total - 1;
            let chunksize = (end - start) + 1;

            const maxChunk = 1024 * 1024;
            if(chunksize > maxChunk) {
                end = start + maxChunk - 1;
                chunksize = (end - start) + 1;
            }

            res.writeHead(206, {
                "Content-Range": "bytes " + start + "-" + end + "/" + total,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": "video/mp4"
            })
            return fs.createReadStream(path, {
                start: start,
                end: end
            }).pipe(res);
        }
        else if(media.mediaType.startsWith('image')) {
            return res.status(200).sendFile(path);
        }

        return res.status(400).send({message: 'Invalid media type.'});
    }
    catch(err) {
        if (err.isJoi) {
            return res.status(400).send({message: (err as ValidationError).message});
        }
        else if(err.code === 'ENOENT') {
            return res.status(404).send({message: 'No media found with that hash'});
        }
        console.error(err);
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }
}

export const listTags = async function (req: Request, res: Response) {
    const schema = Joi.object({
        id: Joi.number()
            .integer()
            .positive()
            .required()
    });

    try {
        const {id}: {id: number} = await schema.validateAsync(req.params);

        const mappings = await TagMediaMapping.findAll({
            where: {
                mediaId: id
            }
        });

        const tags = mappings.map(m => m.tag);

        return res.status(200).send(tags);
    }
    catch(err) {
        if (err.isJoi) {
            return res.status(400).send({message: (err as ValidationError).message});
        }
        console.error(err);
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }
}