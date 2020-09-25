import {Sequelize} from 'sequelize-typescript';
import {database as databaseConfig} from '../config/index';
import Media from "./models/Media";

const sequelize =  new Sequelize({
    ...databaseConfig
});


export default () => {
    sequelize.addModels([Media]);
    return sequelize;
};