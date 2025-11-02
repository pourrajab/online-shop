import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBooleanString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from "class-validator";
import { ValidationMessage } from "src/common/enums/message.enum";
import { ProductType } from "../enum/type.enum";

export class CreateProductDto {
  @ApiProperty()
  @IsString({ message: ValidationMessage.MustBeString })
  @Length(2, 150, { message: ValidationMessage.LengthOutOfRange })
  title: string;
  @ApiProperty()
  @IsString({ message: ValidationMessage.MustBeString })
  @Length(10, 5000, { message: ValidationMessage.LengthOutOfRangeNewsConetnt })
  content: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: ValidationMessage.MustBeString })
  slug?: string;
  @ApiProperty()
  @IsString({ message: ValidationMessage.MustBeString })
  code: string;
  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType, { message: ValidationMessage.InvalidEnum })
  type: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  @Min(0)
  price: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  @Min(0)
  count: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  @Min(0)
  discount: number;
  @ApiPropertyOptional({ type: "boolean" })
  @IsOptional()
  @IsBooleanString({ message: ValidationMessage.MustBeBoolean })
  active_discount: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  categoryId: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
