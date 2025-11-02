import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Basket } from "./entity/basket.entity";
import { BasketController } from "./basket.controller";
import { BasketService } from "./basket.service";
import { ProductModule } from "../product/product.module";
import { DiscountModule } from "../discount/discount.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => ProductModule),
    forwardRef(() => DiscountModule),
    TypeOrmModule.forFeature([Basket]),
  ],
  controllers: [BasketController],
  providers: [BasketService],
  exports: [BasketService, TypeOrmModule],
})
export class BasketModule {}
