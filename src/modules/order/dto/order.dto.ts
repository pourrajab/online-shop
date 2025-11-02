import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsNumber, Min } from "class-validator";
import { OrderStatus } from "../enum/order.enum";
import { ValidationMessage } from "src/common/enums/message.enum";

export class CreateOrderDto {
  @ApiProperty({ description: "شناسه آدرس تحویل" })
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  addressId: number;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ description: "وضعیت جدید سفارش", enum: OrderStatus })
  @IsEnum(OrderStatus, { message: "وضعیت سفارش نامعتبر است" })
  status: OrderStatus;
}

export class OrderFilterDto {
  @ApiPropertyOptional({
    description: "فیلتر بر اساس وضعیت",
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: "وضعیت سفارش نامعتبر است" })
  status?: OrderStatus;

  @ApiPropertyOptional({ description: "شماره صفحه", default: 1 })
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  @Min(1, { message: "شماره صفحه باید حداقل 1 باشد" })
  page?: number = 1;

  @ApiPropertyOptional({ description: "تعداد آیتم در هر صفحه", default: 10 })
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  @Min(1, { message: "تعداد آیتم باید حداقل 1 باشد" })
  limit?: number = 10;
}
