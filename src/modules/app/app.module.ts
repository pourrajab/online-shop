import { PaymentModule } from "./../payment/payment.module";
import { ProductModule } from "./../product/product.module";
import { CategoryModule } from "./../category/category.module";
import { BasketModule } from "../basket/basket.module";
import { OrderModule } from "../order/order.module";
import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { TypeOrmConfig } from "src/config/typeorm.config";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { CustomHttpModule } from "../http/http.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { DataSource } from "typeorm";
import { DiscountModule } from "../discount/discount.module";
import { SupportModule } from "../support/support.module";
import { RoleModule } from "../role/role.module";
import { BlogModule } from "../blog/blog.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), ".env"),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 33 }]),
    TypeOrmModule.forRoot(TypeOrmConfig()),
    CustomHttpModule,
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    BasketModule,
    OrderModule,
    PaymentModule,
    DiscountModule,
    SupportModule,
    RoleModule,
    BlogModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    const { host, database } = this.dataSource.options as {
      host?: string;
      database?: string;
    };
    if (this.dataSource.isInitialized) {
      console.log("✅ Database connected");
    } else {
      console.log("❌ Database is not initialized");
    }
  }
}
