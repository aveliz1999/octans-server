import databaseConfig from './database.json';

import {Dialect} from "sequelize";


type DatabaseConfig = {
    "username": string,
    "password": string,
    "database": string,
    "host": string,
    "dialect": Dialect
}
export const database: DatabaseConfig = databaseConfig as DatabaseConfig;