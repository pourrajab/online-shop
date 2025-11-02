import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { Product } from "./product.entity";
import { Basket } from "src/modules/basket/entity/basket.entity";
import { Order } from "src/modules/order/entity/order.entity";
import { OrderItems } from "src/modules/order/entity/order-items.entity";

@Entity()
export class ProductColor extends BaseEntity {
  @Column()
  productId: number;
  @Column()
  color_name: string;
  @Column()
  color_code: string;
  @Column()
  count: number;
  @Column({ type: "decimal" })
  price: number;
  @Column({ type: "decimal", default: 0 })
  discount: number;
  @Column({ default: false })
  active_discount: boolean;
  @ManyToOne(() => Product, (product) => product.colors, {
    onDelete: "CASCADE",
  })
  product: Product;
  @OneToMany(() => Basket, (basket) => basket.discount)
  baskets: Basket[];
  @OneToMany(() => OrderItems, (order) => order.color)
  orders: OrderItems[];
}
