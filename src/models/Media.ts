import {Table, Column, Model, PrimaryKey, CreatedAt, UpdatedAt, ForeignKey} from 'sequelize-typescript';
import TagMediaMapping from "./TagMediaMapping";

@Table
export default class Media extends Model<Media> {

    @ForeignKey(() => TagMediaMapping)
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

    @CreatedAt
    @Column
    createdAt: Date;

    @UpdatedAt
    @Column
    updatedAt: Date;
}