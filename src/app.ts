import initSequelize from './sequelize';
import express from 'express';
import cookieParser from 'cookie-parser';
import session, {SessionOptions} from 'express-session';
import {session as sessionConfig, redis as redisConfig, files as filesConfig} from '../config/index';
import redis from 'redis';
import connectRedis from 'connect-redis';
import path from "path";

const sequelize = initSequelize();

const RedisStore = connectRedis(session);
const redisClient = redis.createClient(redisConfig)

const app = express();

const sessionOptions: SessionOptions = {
    cookie: {
        maxAge: 3600000,
        httpOnly: false
    },
    name: 'sessId',
    saveUninitialized: true,
    secret: sessionConfig.sessionSecrets,
    resave: true,
    rolling: true,
    store: new RedisStore({client: redisClient})
}
if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    sessionOptions.cookie.secure = true;
}
app.use(session(sessionOptions));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/static', express.static(path.join(filesConfig.fileDirectory, 'storage')))

import usersRoute from './routes/users';
import tagsRoute from './routes/tags';
import mediaRoute from './routes/media';

app.use('/users', usersRoute);
app.use('/tags', tagsRoute);
app.use('/media', mediaRoute);

export default app;