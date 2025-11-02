import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from "typeorm";
import { BlogStatus } from "../enum/status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { BlogLikesEntity } from "./like.entity";
import { BlogBookmarkEntity } from "./bookmark.entity";
import { BlogCommentEntity } from "./comment.entity";
import { BlogCategoryEntity } from "./blog-category.entity";
import { TagEntity } from "../entities/tag.entity";

@Entity(EntityName.Blog)
export class BlogEntity extends BaseEntity {
  @Column()
  title: string;
  @Column()
  content: string;
  @Column({ nullable: true })
  image: string;
  @Column({ unique: true })
  slug: string;
  @Column({ default: BlogStatus.Draft })
  status: string;
  @Column()
  authorId: number;
  @ManyToOne(() => UserEntity, (user) => user.blogs, { onDelete: "CASCADE" })
  author: UserEntity;
  @OneToMany(() => BlogLikesEntity, (like) => like.blog)
  likes: BlogLikesEntity[];
  @OneToMany(() => BlogCategoryEntity, (category) => category.blog)
  categories: BlogCategoryEntity[];
  @OneToMany(() => BlogBookmarkEntity, (bookmark) => bookmark.blog)
  bookmarks: BlogBookmarkEntity[];
  @OneToMany(() => BlogCommentEntity, (comment) => comment.blog)
  comments: BlogCommentEntity[];
  @ManyToMany(() => TagEntity, (tag) => tag.blogs, { cascade: true })
  @JoinTable({
    name: "blog_tags",
    joinColumn: { name: "blogId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tagId", referencedColumnName: "id" },
  })
  tags: TagEntity[];
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
