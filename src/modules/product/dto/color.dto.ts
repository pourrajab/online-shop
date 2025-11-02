import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsBoolean } from "class-validator";
import { ProductType } from "../enum/type.enum";

export class AddColorDto {
  @ApiProperty()
  @IsString()
  color_name: string;

  @ApiProperty()
  @IsString()
  color_code: string;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  count?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ type: "boolean" })
  @IsOptional()
  @IsBoolean()
  active_discount?: boolean;
}

export class UpdateColorDto extends PartialType(AddColorDto) {}
