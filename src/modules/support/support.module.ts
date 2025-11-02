import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupportTicket } from "./entity/support-ticket.entity";
import { SupportMessage } from "./entity/support-message.entity";
import { SupportService } from "./support.service";
import { SupportController } from "./support.controller";
import { SupportGateway } from "./support.gateway";
import { AuthModule } from "src/modules/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicket, SupportMessage]),
    AuthModule,
  ],
  controllers: [SupportController],
  providers: [SupportService, SupportGateway],
  exports: [SupportService],
})
export class SupportModule {}
