import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { Product } from "./product.entity";

@Entity()
export class ProductImage extends BaseEntity {
  @Column()
  productId: number;

  @Column()
  url: string;

  @Column()
  key: string;

  @Column({ default: 0 })
  sort: number;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: "CASCADE",
  })
  product: Product;
}
