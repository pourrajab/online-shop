import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { Product } from "./product.entity";

@Entity()
export class ProductDetail extends BaseEntity {
  @Column()
  productId: number;
  @Column()
  key: string;
  @Column()
  value: string;
  @ManyToOne(() => Product, (product) => product.details, {
    onDelete: "CASCADE",
  })
  product: Product;
}
