import {Table, Column, Model, PrimaryKey, CreatedAt, UpdatedAt} from 'sequelize-typescript';

@Table
export default class Tag extends Model<Tag> {

    @PrimaryKey
    @Column
    id: number;

    @Column
    namespace: string;

    @Column
    tagName: string;

    @CreatedAt
    @Column
    createdAt: string;

    @UpdatedAt
    @Column
    updatedAt: string;
}