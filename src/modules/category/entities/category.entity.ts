import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.Category)
export class CategoryEntity extends BaseEntity {
  @Column()
  title: string;
  @Column({ unique: true })
  slug: string;
  @Column({ nullable: true })
  image: string;
  @Column({ nullable: true })
  imageKey: string;
  @Column({ default: true })
  show: boolean;
  @Column({ nullable: true })
  parentId: number;
  @Column({ default: 0 })
  priority: number;
  @ManyToOne(() => CategoryEntity, (category) => category.children, {
    onDelete: "CASCADE",
  })
  parent: CategoryEntity;
  @OneToMany(() => CategoryEntity, (category) => category.parent)
  children: CategoryEntity[];
}
