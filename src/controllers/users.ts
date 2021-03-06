import {Request, Response} from "express";
import User from '../models/User';
import Joi, {ValidationError} from 'joi';
import bcrypt from 'bcrypt';
import {passwords as passwordsConfig} from '../../config/index';

declare module 'express-session' {
    interface SessionData {
        user: number
    }
}

export const createUser = async function (req: Request, res: Response) {
    const schema = Joi.object({
        username: Joi.string()
            .min(1)
            .max(16)
            .required(),
        password: Joi.string()
            .min(1)
            .max(50)
            .regex(/[a-zA-Z0-9 `~!@#$%^&*()\-_+=[\]{};:'"<>,./?\\]+/)
            .required()
    });

    try {
        const {username, password} = await schema.validateAsync(req.body);

        const existingUser = await User.findOne({
            where: {
                username
            }
        });
        if (existingUser) {
            return res.status(400).send({message: 'An account with that username already exists.'})
        }

        const user = await User.create({
            username,
            password: await bcrypt.hash(password, passwordsConfig.saltRounds)
        });

        return res.status(201).send(user);
    } catch (err) {
        if (err.isJoi) {
            return res.status(400).send({message: (err as ValidationError).message});
        }
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }
}

export const login = async function (req: Request, res: Response) {
    if (req.session.user) {
        const user = await User.findOne({
            where: {
                id: req.session.user
            }
        });
        return res.status(200).send(user);
    }

    const schema = Joi.object({
        username: Joi.string()
            .min(1)
            .max(16)
            .required(),
        password: Joi.string()
            .min(1)
            .max(50)
            .regex(/[a-zA-Z0-9 `~!@#$%^&*()\-_+=[\]{};:'"<>,./?\\]+/)
            .required()
    });

    try {
        const {username, password} = await schema.validateAsync(req.body);

        const user: User = await User.scope('withPassword').findOne({
            where: {
                username
            }
        });
        if (!user) {
            return res.status(401).send({message: 'Invalid username or password.'})
        }

        const matches = await bcrypt.compare(password, user.password);
        if (!matches) {
            return res.status(401).send({message: 'Invalid username or password.'})
        }

        req.session.user = user.id;
        return res.status(200).send(user);
    } catch (err) {
        if (err.isJoi) {
            return res.status(400).send({message: (err as ValidationError).message});
        }
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }
}