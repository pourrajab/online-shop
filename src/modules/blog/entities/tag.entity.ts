import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, ManyToMany } from "typeorm";
import { BlogEntity } from "./blog.entity";

@Entity(EntityName.BlogTag)
export class TagEntity extends BaseEntity {
  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @ManyToMany(() => BlogEntity, (blog) => blog.tags)
  blogs: BlogEntity[];
}
