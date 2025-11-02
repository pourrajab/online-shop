import { Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { AddressService } from "./services/address.service";
import { AddressController } from "./controllers/address.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { ProfileEntity } from "./entities/profile.entity";
import { OtpEntity } from "./entities/otp.entity";
import { AddressEntity } from "./entities/address.entity";
import { AuthModule } from "../auth/auth.module";
import { Basket } from "../basket/entity/basket.entity";
import { Order } from "../order/entity/order.entity";
import { Payment } from "../payment/entity/payment.entity";
import { SupportTicket } from "../support/entity/support-ticket.entity";
import { BlogEntity } from "../blog/entities/blog.entity";
import { BlogLikesEntity } from "../blog/entities/like.entity";
import { BlogBookmarkEntity } from "../blog/entities/bookmark.entity";
import { BlogCommentEntity } from "../blog/entities/comment.entity";
import { BlogCategoryEntity } from "../blog/entities/blog-category.entity";
import { TagEntity } from "../blog/entities/tag.entity";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      UserEntity,
      ProfileEntity,
      OtpEntity,
      AddressEntity,
      Basket,
      Order,
      Payment,
      SupportTicket,
      BlogEntity,
      BlogLikesEntity,
      BlogBookmarkEntity,
      BlogCommentEntity,
      BlogCategoryEntity,
      TagEntity,
    ]),
  ],
  controllers: [UserController, AddressController],
  providers: [UserService, AddressService],
  exports: [UserService, AddressService, TypeOrmModule],
})
export class UserModule {}
