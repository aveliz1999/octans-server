import {Sequelize} from 'sequelize-typescript';
import {database as databaseConfig} from '../config/index';
import Media from "./models/Media";
import User from "./models/User";

const sequelize =  new Sequelize({
    ...databaseConfig
});


export default () => {
    sequelize.addModels([Media, User]);
    return sequelize;
};