import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BasketService } from "../basket/basket.service";
import { Basket } from "../basket/entity/basket.entity";
import { DiscountModule } from "../discount/discount.module";
import { CustomHttpModule } from "../http/http.module";
import { OrderItems } from "../order/entity/order-items.entity";
import { Order } from "../order/entity/order.entity";
import { OrderModule } from "../order/order.module";
import { ProductModule } from "../product/product.module";
import { Payment } from "./entity/payment.entity";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    AuthModule,
    ProductModule,
    DiscountModule,
    OrderModule,
    CustomHttpModule,
    TypeOrmModule.forFeature([Payment, Basket, Order]),
  ],
  controllers: [PaymentController],
  providers: [BasketService, PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
