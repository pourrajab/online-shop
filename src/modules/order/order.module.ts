import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entity/order.entity";
import { OrderItems } from "./entity/order-items.entity";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { AuthModule } from "../auth/auth.module";
import { UserEntity } from "../user/entities/user.entity";
import { Product } from "../product/entities/product.entity";
import { ProductColor } from "../product/entities/product-color.entity";
import { ProductSize } from "../product/entities/product-size.entity";
import { BasketModule } from "../basket/basket.module";
import { AddressEntity } from "../user/entities/address.entity";

@Module({
  imports: [
    AuthModule,
    BasketModule,
    TypeOrmModule.forFeature([
      Order,
      OrderItems,
      UserEntity,
      Product,
      ProductColor,
      ProductSize,
      AddressEntity,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService, TypeOrmModule],
})
export class OrderModule {}
