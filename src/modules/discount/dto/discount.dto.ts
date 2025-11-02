import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Length,
} from "class-validator";
import { DiscountType } from "../type.enum";
import { ValidationMessage } from "src/common/enums/message.enum";

export class CreateDiscountDto {
  @ApiProperty({ description: "کد تخفیف" })
  @IsString({ message: ValidationMessage.MustBeString })
  @Length(3, 20, { message: "کد تخفیف باید بین 3 تا 20 کاراکتر باشد" })
  code: string;

  @ApiPropertyOptional({ description: "درصد تخفیف" })
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  percent: number;

  @ApiPropertyOptional({ description: "مبلغ تخفیف" })
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  amount: number;

  @ApiPropertyOptional({ description: "حداکثر تعداد استفاده" })
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  limit: number;

  @ApiPropertyOptional({ description: "تاریخ انقضا" })
  @IsOptional()
  @IsString({ message: ValidationMessage.MustBeString })
  expires_in: string;

  @ApiPropertyOptional({ description: "شناسه محصول (برای تخفیف محصول)" })
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  productId?: number;

  @ApiPropertyOptional({ description: "نوع تخفیف", enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType, { message: ValidationMessage.InvalidEnum })
  type: string;
}

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {}
