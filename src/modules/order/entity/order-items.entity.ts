import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Order } from "./order.entity";
import { Product } from "../../product/entities/product.entity";
import { ProductColor } from "../../product/entities/product-color.entity";
import { ProductSize } from "../../product/entities/product-size.entity";

@Entity(EntityName.OrderItems)
export class OrderItems extends BaseEntity {
  @Column()
  orderId: number;

  @Column()
  productId: number;

  @Column({ nullable: true })
  colorId: number;

  @Column({ nullable: true })
  sizeId: number;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn()
  order: Order;

  @ManyToOne(() => Product, (product) => product.orders, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  product: Product;

  @ManyToOne(() => ProductSize, (size) => size.orders, { onDelete: "CASCADE" })
  @JoinColumn()
  size: ProductSize;

  @ManyToOne(() => ProductColor, (color) => color.orders, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  color: ProductColor;
}
