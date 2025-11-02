import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
} from "class-validator";
import { Length } from "class-validator";
import { ValidationMessage } from "src/common/enums/message.enum";

export class CreateRoleDto {
  @ApiProperty({ description: "نام نقش" })
  @IsString()
  @Length(2, 50, { message: ValidationMessage.TooShort })
  name: string;

  @ApiPropertyOptional({ description: "توضیحات نقش" })
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: ValidationMessage.TooLong })
  description?: string;

  @ApiPropertyOptional({ description: "آیا نقش فعال است", default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: "مجوزهای نقش" })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: "نام نقش" })
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: ValidationMessage.TooShort })
  name?: string;

  @ApiPropertyOptional({ description: "توضیحات نقش" })
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: ValidationMessage.TooLong })
  description?: string;

  @ApiPropertyOptional({ description: "آیا نقش فعال است" })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: "مجوزهای نقش" })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}

export class AssignRoleDto {
  @ApiProperty({ description: "شناسه کاربر" })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: "شناسه نقش" })
  @IsNumber()
  roleId: number;
}

export class RoleFilterDto {
  @ApiPropertyOptional({ description: "جستجو بر اساس نام" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "فیلتر بر اساس وضعیت فعال" })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: "صفحه", default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: "تعداد در هر صفحه", default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
