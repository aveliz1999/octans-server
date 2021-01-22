import {Table, Column, Model, PrimaryKey, CreatedAt, UpdatedAt, DefaultScope} from 'sequelize-typescript';

@DefaultScope(() => ({
    attributes: {
        exclude: ['password']
    }
}))
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
    createdAt: Date;

    @UpdatedAt
    @Column
    updatedAt: Date;
}

User.prototype.toJSON = function (): object {
    const values = Object.assign({}, this.get());

    delete values.password;
    return values;
}