import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional } from "class-validator";
import { ProductType } from "../enum/type.enum";

export class AddDetailDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value?: string;
}

export class UpdateDetailDto extends PartialType(AddDetailDto) {}
