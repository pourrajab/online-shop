import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { Response } from "express";
import { PaymentService } from "./payment.service";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import {
  CreatePaymentDto,
  PaymentFilterDto,
  PaymentVerifyDto,
} from "./dto/payment.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { IUser } from "src/common/types/request";

@Controller("payment")
@ApiTags("Payment")
@AuthDecorator()
@ApiBearerAuth("Authorization")
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: "ایجاد پرداخت جدید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: IUser
  ) {
    return this.paymentService.create(createPaymentDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "دریافت لیست پرداخت‌های کاربر" })
  async getUserPayments(
    @Query() filterDto: PaymentFilterDto,
    @CurrentUser() user: IUser
  ) {
    return this.paymentService.getUserPayments(user.id, filterDto);
  }

  @Get("admin")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "دریافت لیست تمام پرداخت‌ها (ادمین)" })
  async getAllPayments(@Query() filterDto: PaymentFilterDto) {
    return this.paymentService.getAllPayments(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "دریافت آمار پرداخت‌های کاربر" })
  async getUserPaymentStats(@CurrentUser() user: IUser) {
    return this.paymentService.getPaymentStats(user.id);
  }

  @Get("admin/stats")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "دریافت آمار کلی پرداخت‌ها (ادمین)" })
  async getAllPaymentStats() {
    return this.paymentService.getPaymentStats();
  }

  @Get(":id")
  @ApiOperation({ summary: "دریافت جزئیات پرداخت" })
  async getPaymentById(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: IUser
  ) {
    return this.paymentService.getPaymentById(id, user.id);
  }

  @Post("verify")
  @ApiOperation({ summary: "تایید پرداخت" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verify(@Body() verifyDto: PaymentVerifyDto) {
    return this.paymentService.verify(verifyDto);
  }

  @Get("verify/callback")
  @ApiOperation({ summary: "کالبک تایید پرداخت از درگاه" })
  async verifyCallback(
    @Query("Authority") authority: string,
    @Query("Status") status: string,
    @Res() res: Response
  ) {
    const result = await this.paymentService.verify({ authority, status });
    return res.redirect(result.redirectUrl);
  }

  @Get("legacy/list")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "دریافت لیست پرداخت‌ها (Legacy)" })
  async find() {
    return this.paymentService.find();
  }
}
