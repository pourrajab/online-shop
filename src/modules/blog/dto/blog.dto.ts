import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  Length,
  IsOptional,
  IsEnum,
  IsInt,
} from "class-validator";
import { Transform } from "class-transformer";
import { IsString } from "class-validator";
import { BlogStatus } from "../enum/status.enum";
import { ValidationMessage } from "src/common/enums/message.enum";
import { PartialType } from "@nestjs/mapped-types";

export class CreateBlogDto {
  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  @Length(10, 150, { message: ValidationMessage.LengthOutOfRangeNewsTitle })
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: ValidationMessage.MustBeString })
  slug?: string;

  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  @Length(10, undefined, {
    message: ValidationMessage.LengthOutOfRangeNewsConetnt,
  })
  content: string;

  @ApiPropertyOptional()
  image: string;

  @ApiPropertyOptional({
    type: Number,
    isArray: true,
    description: "IDs of categories",
  })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((n) => Number(n))
        .filter((n) => !Number.isNaN(n));
    }
    if (Array.isArray(value)) {
      return value
        .map((v) => (typeof v === "string" ? Number(v) : v))
        .filter((n) => typeof n === "number" && !Number.isNaN(n));
    }
    return value;
  })
  @IsOptional()
  @IsArray({ message: "categoryIds باید آرایه باشد" })
  @IsInt({ each: true, message: "هر categoryId باید عدد صحیح باشد" })
  categoryIds?: number[];

  @ApiPropertyOptional({ type: String, isArray: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim());
    }
    return value;
  })
  @IsOptional()
  @IsArray({ message: "تگ‌ها باید به صورت آرایه ارسال شوند" })
  tags?: string[];
}

export class UpdateBlogDto extends PartialType(CreateBlogDto) {}

export class FilterBlogDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Length(1, 50)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: BlogStatus })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional()
  @IsOptional()
  authorId?: number;

  @ApiPropertyOptional({ description: "from date ISO (created_at >= from)" })
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: "to date ISO (created_at <= to)" })
  @IsOptional()
  to?: string;
}
