import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { OrderService } from "./order.service";
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderFilterDto,
} from "./dto/order.dto";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { BasketService } from "../basket/basket.service";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { IUser } from "src/common/types/request";
import { BadRequestMessage } from "src/common/enums/message.enum";

@Controller("order")
@ApiTags("Order")
@AuthDecorator()
@ApiBearerAuth("Authorization")
export class OrderController {
  constructor(
    private orderService: OrderService,
    private basketService: BasketService
  ) {}

  @Post()
  @ApiOperation({ summary: "ایجاد سفارش جدید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: IUser
  ) {
    const basketData = await this.basketService.getBasket(user.id);
    if (!basketData.products || basketData.products.length === 0) {
      throw new BadRequestException(BadRequestMessage.BasketEmpty);
    }
    return this.orderService.createOrder(createOrderDto, user.id, basketData);
  }

  @Get()
  @ApiOperation({ summary: "دریافت لیست سفارش‌های کاربر" })
  async getUserOrders(
    @Query() filterDto: OrderFilterDto,
    @CurrentUser() user: IUser
  ) {
    return this.orderService.getUserOrders(user.id, filterDto);
  }

  @Get("admin")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "دریافت لیست تمام سفارش‌ها (ادمین)" })
  async getAllOrders(@Query() filterDto: OrderFilterDto) {
    return this.orderService.getAllOrders(filterDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "دریافت جزئیات سفارش" })
  async getOrderById(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: IUser
  ) {
    return this.orderService.getOrderById(id, user.id);
  }

  @Put(":id/status")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "بروزرسانی وضعیت سفارش" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updateOrderStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderStatusDto
  ) {
    return this.orderService.updateOrderStatus(id, updateDto);
  }

  @Put(":id/process")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "شروع پردازش سفارش" })
  async setInProcess(@Param("id", ParseIntPipe) id: number) {
    return this.orderService.setInProcess(id);
  }

  @Put(":id/pack")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "بسته‌بندی سفارش" })
  async setPacked(@Param("id", ParseIntPipe) id: number) {
    return this.orderService.setPacked(id);
  }

  @Put(":id/transit")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "ارسال سفارش" })
  async setToTransit(@Param("id", ParseIntPipe) id: number) {
    return this.orderService.setToTransit(id);
  }

  @Put(":id/deliver")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "تحویل سفارش" })
  async delivery(@Param("id", ParseIntPipe) id: number) {
    return this.orderService.delivery(id);
  }

  @Put(":id/cancel")
  @ApiOperation({ summary: "لغو سفارش" })
  async canceled(@Param("id", ParseIntPipe) id: number) {
    return this.orderService.canceled(id);
  }
}
