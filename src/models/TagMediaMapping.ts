import {
    Table,
    Column,
    Model,
    PrimaryKey,
    CreatedAt,
    UpdatedAt,
    HasOne,
    DefaultScope,
    ForeignKey, AutoIncrement
} from 'sequelize-typescript';
import Tag from "./Tag";
import Media from "./Media";

@DefaultScope(() => ({
    include: [Tag, Media],
    attributes: {
        exclude: ['tagId', 'mediaId']
    }
}))
@Table
export default class TagMediaMapping extends Model {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    tagId: number;

    @HasOne(() => Tag)
    tag: Tag;

    @Column
    mediaId: number;

    @HasOne(() => Media)
    media: Media;

    @CreatedAt
    @Column
    createdAt: Date;

    @UpdatedAt
    @Column
    updatedAt: Date;
}