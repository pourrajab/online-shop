import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { SupportService } from "./support.service";
import {
  CreateSupportTicketDto,
  UpdateSupportTicketDto,
  SupportTicketFilterDto,
} from "./dto/support-ticket.dto";
import {
  CreateSupportMessageDto,
  SupportMessageFilterDto,
  MarkAsReadDto,
} from "./dto/support-message.dto";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { IUser } from "src/common/types/request";

@ApiTags("Support")
@Controller("support")
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post("tickets")
  @AuthDecorator()
  @ApiOperation({ summary: "ایجاد تیکت پشتیبانی جدید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async createTicket(
    @Body() createTicketDto: CreateSupportTicketDto,
    @CurrentUser() user: IUser
  ) {
    return await this.supportService.createTicket(createTicketDto, user.id);
  }

  @Get("tickets")
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "دریافت لیست تمام تیکت‌های پشتیبانی (ادمین)" })
  async getAllTickets(@Query() filterDto: SupportTicketFilterDto) {
    return await this.supportService.getAllTickets(filterDto);
  }

  @Get("tickets/my")
  @AuthDecorator()
  @ApiOperation({ summary: "دریافت تیکت‌های کاربر" })
  async getUserTickets(
    @Query() filterDto: SupportTicketFilterDto,
    @CurrentUser() user: IUser
  ) {
    return await this.supportService.getUserTickets(user.id, filterDto);
  }

  @Get("tickets/:id")
  @AuthDecorator()
  @ApiOperation({ summary: "دریافت جزئیات تیکت پشتیبانی" })
  @ApiParam({ name: "id", description: "شناسه تیکت" })
  async getTicketById(
    @Param("id", ParseIntPipe) ticketId: number,
    @CurrentUser() user: IUser
  ) {
    return await this.supportService.getTicketById(ticketId, user.id);
  }

  @Put("tickets/:id")
  @AuthDecorator()
  @ApiOperation({ summary: "بروزرسانی تیکت پشتیبانی" })
  @ApiParam({ name: "id", description: "شناسه تیکت" })
  async updateTicket(
    @Param("id", ParseIntPipe) ticketId: number,
    @Body() updateTicketDto: UpdateSupportTicketDto,
    @CurrentUser() user: IUser
  ) {
    const isAdmin = user.role === Roles.Admin;
    return await this.supportService.updateTicket(
      ticketId,
      updateTicketDto,
      user.id,
      isAdmin
    );
  }

  @Put("tickets/:id/close")
  @AuthDecorator()
  @ApiOperation({ summary: "بستن تیکت پشتیبانی" })
  @ApiParam({ name: "id", description: "شناسه تیکت" })
  async closeTicket(
    @Param("id", ParseIntPipe) ticketId: number,
    @CurrentUser() user: IUser
  ) {
    const isAdmin = user.role === Roles.Admin;
    return await this.supportService.closeTicket(ticketId, user.id, isAdmin);
  }

  @Post("messages")
  @AuthDecorator()
  @ApiOperation({ summary: "ارسال پیام در تیکت پشتیبانی" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async sendMessage(
    @Body() createMessageDto: CreateSupportMessageDto,
    @CurrentUser() user: IUser
  ) {
    return await this.supportService.sendMessage(createMessageDto, user.id);
  }

  @Get("tickets/:id/messages")
  @AuthDecorator()
  @ApiOperation({ summary: "دریافت پیام‌های تیکت پشتیبانی" })
  @ApiParam({ name: "id", description: "شناسه تیکت" })
  async getTicketMessages(
    @Param("id", ParseIntPipe) ticketId: number,
    @Query() filterDto: SupportMessageFilterDto,
    @CurrentUser() user: IUser
  ) {
    return await this.supportService.getTicketMessages(
      ticketId,
      filterDto,
      user.id
    );
  }

  @Put("messages/read")
  @AuthDecorator()
  @ApiOperation({ summary: "علامت‌گذاری پیام به عنوان خوانده شده" })
  async markMessageAsRead(
    @Body() markAsReadDto: MarkAsReadDto,
    @CurrentUser() user: IUser
  ) {
    return await this.supportService.markMessageAsRead(markAsReadDto, user.id);
  }

  @Get("stats")
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "دریافت آمار پشتیبانی (ادمین)" })
  async getSupportStats() {
    return await this.supportService.getSupportStats();
  }

  @Get("stats/my")
  @AuthDecorator()
  @ApiOperation({ summary: "دریافت آمار پشتیبانی کاربر" })
  async getUserSupportStats(@CurrentUser() user: IUser) {
    return await this.supportService.getSupportStats(user.id);
  }
}
