import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { AuthModule } from "src/modules/auth/auth.module";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Role, Permission, UserEntity]),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService, TypeOrmModule],
})
export class RoleModule {}
