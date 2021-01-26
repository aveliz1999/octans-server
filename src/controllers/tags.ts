import {Request, Response} from "express";
import Tag from '../models/Tag';
import {Op} from 'sequelize';
import Joi, {ValidationError} from 'joi';

export const getTagById = async function (req: Request, res: Response) {
    const tag = await Tag.findOne({
        where: {
            id: req.params.id
        }
    });
    if(!tag) {
        return res.status(404).send({message: 'No tag with that ID found'});
    }

    return res.status(200).send(tag);
}

export const getTagByName = async function (req: Request, res: Response) {
    const schema = Joi.object({
        namespace: Joi.string()
            .alphanum()
            .max(64)
            .allow('')
            .optional(),
        tagName: Joi.string()
            .regex(/[a-zA-Z0-9 -_]+/)
            .max(64)
            .min(1)
            .required()
    });
    const tagName = req.params.tagName;
    const splitTag = tagName.split(':');
    const tagObject: {namespace?: string, tagName?: string} = {};
    if(splitTag.length === 2) {
        tagObject.namespace = splitTag[0];
        tagObject.tagName = splitTag[1];
    }
    else {
        tagObject.namespace = '';
        tagObject.tagName = splitTag[0];
    }

    try {
        const data: {namespace?: string, tagName: string} = await schema.validateAsync(tagObject);
        const tag = await Tag.findOne({
            where: data
        });
        if(!tag) {
            return res.status(404).send({message: 'No tag found'});
        }

        return res.status(200).send(tag);
    }
    catch(err) {
        if (err.isJoi) {
            return res.status(400).send({message: (err as ValidationError).message});
        }
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }
}

export const search = async function (req: Request, res: Response) {
    const postSchema = Joi.object({
        tagName: Joi.string()
            .regex(/[a-zA-Z0-9 -_]+/)
            .max(128)
            .min(1)
            .required(),
        exclude: Joi.array()
            .has(Joi.number().integer().positive())
            .optional()
    });

    const schema = Joi.object({
        namespace: Joi.string()
            .alphanum()
            .max(64)
            .allow('')
            .optional(),
        tagName: Joi.string()
            .regex(/[a-zA-Z0-9 -_]+/)
            .max(64)
            .min(1)
            .required()
    });

    try {
        const postInfo: {tagName: string, exclude?: number[]} = await postSchema.validateAsync(req.body);
        const {tagName: preTagName} = postInfo;
        const exclude = postInfo.exclude ? postInfo.exclude : [];

        const namespace = preTagName.includes(':') ? preTagName.split(':')[0] : null;
        const tagName = preTagName.includes(':') ? preTagName.split(':')[1] : preTagName;

        let tags;
        if(namespace) {
            tags = await Tag.findAll({
                where: {
                    namespace,
                    tagName: {
                        [Op.like]: `%${tagName}%`
                    },
                    id: {
                        [Op.notIn]: exclude
                    }
                },
                limit: 10
            });
        }
        else {
            tags = await Tag.findAll({
                where: {
                    [Op.or]: [
                        {
                            tagName: {
                                [Op.like]: `%${tagName}%`
                            }
                        },
                        {
                            namespace: {
                                [Op.like]: `%${tagName}%`
                            }
                        }
                    ],
                    id: {
                        [Op.notIn]: exclude
                    }
                }
            })
        }

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