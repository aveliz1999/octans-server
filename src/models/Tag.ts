import {Table, Column, Model, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement, ForeignKey} from 'sequelize-typescript';
import TagMediaMapping from "./TagMediaMapping";

@Table
export default class Tag extends Model<Tag> {

    @ForeignKey(() => TagMediaMapping)
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    namespace: string;

    @Column
    tagName: string;

    @CreatedAt
    @Column
    createdAt: Date;

    @UpdatedAt
    @Column
    updatedAt: Date;
}