import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsBoolean } from "class-validator";

export class AddSizeDto {
  @ApiProperty()
  @IsString()
  size: string;

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

export class UpdateSizeDto extends PartialType(AddSizeDto) {}
