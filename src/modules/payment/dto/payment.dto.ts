import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
} from "class-validator";
import { ValidationMessage } from "src/common/enums/message.enum";

export class CreatePaymentDto {
  @ApiProperty({ description: "شناسه سفارش" })
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  orderId: number;

  @ApiPropertyOptional({ description: "توضیحات پرداخت" })
  @IsOptional()
  @IsString({ message: ValidationMessage.MustBeString })
  description?: string;
}

export class PaymentFilterDto {
  @ApiPropertyOptional({ description: "فیلتر بر اساس وضعیت پرداخت" })
  @IsOptional()
  @IsBoolean({ message: ValidationMessage.MustBeBoolean })
  status?: boolean;

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

export class PaymentVerifyDto {
  @ApiProperty({ description: "کد Authority از درگاه پرداخت" })
  @IsString({ message: ValidationMessage.MustBeString })
  authority: string;

  @ApiProperty({ description: "وضعیت پرداخت از درگاه" })
  @IsString({ message: ValidationMessage.MustBeString })
  status: string;
}
