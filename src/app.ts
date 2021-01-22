import initSequelize from './sequelize';
import express from 'express';
import cookieParser from 'cookie-parser';

const sequelize = initSequelize();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

import usersRoute from './routes/users';

app.use('/users', usersRoute);


export default app;