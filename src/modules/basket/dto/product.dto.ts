import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";
import { ValidationMessage } from "src/common/enums/message.enum";

export class BasketDto {
  @ApiProperty({ description: "شناسه محصول" })
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  productId: number;

  @ApiPropertyOptional({ description: "شناسه رنگ محصول" })
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  colorId: number;

  @ApiPropertyOptional({ description: "شناسه سایز محصول" })
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  sizeId: number;
}
