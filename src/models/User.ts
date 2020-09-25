import {Table, Column, Model, PrimaryKey, CreatedAt, UpdatedAt} from 'sequelize-typescript';

@Table
export default class User extends Model<User> {

    @PrimaryKey
    @Column
    id: number;

    @Column
    username: string;

    @Column
    password: string;

    @CreatedAt
    @Column
    createdAt: string;

    @UpdatedAt
    @Column
    updatedAt: string;
}