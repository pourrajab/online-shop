import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { ProductColor } from "./entities/product-color.entity";
import { ProductSize } from "./entities/product-size.entity";
import { ProductDetail } from "./entities/product-detail.entity";
import { ProductImage } from "./entities/product-image.entity";
import { CategoryEntity } from "src/modules/category/entities/category.entity";
import { ProductController } from "./controller/product.controller";
import { ProductSizeController } from "./controller/product-size.controller";
import { ProductColorController } from "./controller/product-color.controller";
import { ProductDetailController } from "./controller/product-detail.controller";
import { ProductService } from "./service/product.service";
import { ProductDetailService } from "./service/product-detail.service";
import { ProductSizeService } from "./service/product-size.service";
import { ProductColorService } from "./service/product-color.service";
import { S3Service } from "src/modules/s3/s3.service";
import { AuthModule } from "src/modules/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductColor,
      ProductSize,
      ProductDetail,
      ProductImage,
      CategoryEntity,
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [
    ProductController,
    ProductSizeController,
    ProductColorController,
    ProductDetailController,
  ],
  providers: [
    ProductService,
    ProductDetailService,
    ProductSizeService,
    ProductColorService,
    S3Service,
  ],
  exports: [
    ProductService,
    ProductDetailService,
    ProductSizeService,
    ProductColorService,
    TypeOrmModule,
  ],
})
export class ProductModule {}
