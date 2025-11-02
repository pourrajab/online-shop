import { Column, Entity, ManyToOne } from "typeorm";
import { Product } from "src/modules/product/entities/product.entity";
import { ProductColor } from "src/modules/product/entities/product-color.entity";
import { ProductSize } from "src/modules/product/entities/product-size.entity";
import { Discount } from "src/modules/discount/entity/discount.entity";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.Basket)
export class Basket extends BaseEntity {
  @Column({ nullable: true })
  productId: number;

  @Column({ nullable: true })
  sizeId: number;

  @Column({ nullable: true })
  colorId: number;

  @Column({ nullable: true })
  discountId: number;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  guestId: string;

  @Column()
  count: number;

  @ManyToOne(() => Product, (product) => product.baskets, {
    onDelete: "CASCADE",
  })
  product: Product;

  @ManyToOne(() => ProductColor, (color) => color.baskets, {
    onDelete: "CASCADE",
  })
  color: ProductColor;

  @ManyToOne(() => ProductSize, (size) => size.baskets, { onDelete: "CASCADE" })
  size: ProductSize;

  @ManyToOne(() => Discount, (discount) => discount.baskets, {
    onDelete: "CASCADE",
  })
  discount: Discount;

  @ManyToOne(() => UserEntity, (user) => user.baskets, {
    onDelete: "CASCADE",
  })
  user: UserEntity;
}
