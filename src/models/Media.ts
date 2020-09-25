import {Table, Column, Model, PrimaryKey} from 'sequelize-typescript';

@Table
export default class Media extends Model<Media> {

    @PrimaryKey
    @Column
    id: number;

    @Column
    hash: string;

    @Column
    mediaType: string;

    @Column
    width: number;

    @Column
    height: number;

    @Column
    duration: number;

    @Column
    size: number;
}