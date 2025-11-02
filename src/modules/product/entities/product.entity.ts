import { Basket } from "../../basket/entity/basket.entity";
import { OrderItems } from "../../order/entity/order-items.entity";
import { Discount } from "../../discount/entity/discount.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { ProductType } from "../enum/type.enum";
import { ProductColor } from "./product-color.entity";
import { ProductDetail } from "./product-detail.entity";
import { ProductSize } from "./product-size.entity";
import { ProductImage } from "./product-image.entity";
import { CategoryEntity } from "../../category/entities/category.entity";

@Entity()
export class Product extends BaseEntity {
  @Column()
  title: string;
  @Column()
  content: string;
  @Column()
  slug: string;
  @Column()
  code: string;
  @Column({ type: "enum", enum: ProductType })
  type: string;
  @Column({ default: 0 })
  count: number;
  @Column({ type: "decimal", nullable: true })
  price: number;
  @Column({ type: "decimal", nullable: true, default: 0 })
  discount: number;
  @Column({ nullable: true, default: false })
  active_discount: boolean;
  @Column({ nullable: true })
  categoryId: number;
  @CreateDateColumn()
  created_at: Date;
  @OneToMany(() => ProductDetail, (detail) => detail.product)
  details: ProductDetail[];
  @OneToMany(() => ProductColor, (color) => color.product)
  colors: ProductColor[];
  @OneToMany(() => ProductSize, (size) => size.product)
  sizes: ProductSize[];
  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];
  @ManyToOne(() => CategoryEntity, (cat) => cat.children, { nullable: true })
  category: CategoryEntity;
  @OneToMany(() => Basket, (basket) => basket.discount)
  baskets: Basket[];
  @OneToMany(() => OrderItems, (order) => order.product)
  orders: OrderItems[];
}
