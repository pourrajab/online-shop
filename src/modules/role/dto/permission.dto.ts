import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
} from "class-validator";
import { Length } from "class-validator";
import { ValidationMessage } from "src/common/enums/message.enum";
import { PermissionResource, PermissionAction } from "../enums/permission.enum";

export class CreatePermissionDto {
  @ApiProperty({ description: "نام مجوز" })
  @IsString()
  @Length(2, 50, { message: ValidationMessage.TooShort })
  name: string;

  @ApiPropertyOptional({ description: "توضیحات مجوز" })
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: ValidationMessage.TooLong })
  description?: string;

  @ApiProperty({ description: "منبع مجوز", enum: PermissionResource })
  @IsEnum(PermissionResource)
  resource: PermissionResource;

  @ApiProperty({ description: "عمل مجوز", enum: PermissionAction })
  @IsEnum(PermissionAction)
  action: PermissionAction;

  @ApiPropertyOptional({ description: "آیا مجوز فعال است", default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ description: "نام مجوز" })
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: ValidationMessage.TooShort })
  name?: string;

  @ApiPropertyOptional({ description: "توضیحات مجوز" })
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: ValidationMessage.TooLong })
  description?: string;

  @ApiPropertyOptional({ description: "منبع مجوز", enum: PermissionResource })
  @IsOptional()
  @IsEnum(PermissionResource)
  resource?: PermissionResource;

  @ApiPropertyOptional({ description: "عمل مجوز", enum: PermissionAction })
  @IsOptional()
  @IsEnum(PermissionAction)
  action?: PermissionAction;

  @ApiPropertyOptional({ description: "آیا مجوز فعال است" })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class PermissionFilterDto {
  @ApiPropertyOptional({ description: "جستجو بر اساس نام" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "فیلتر بر اساس منبع" })
  @IsOptional()
  @IsEnum(PermissionResource)
  resource?: PermissionResource;

  @ApiPropertyOptional({ description: "فیلتر بر اساس عمل" })
  @IsOptional()
  @IsEnum(PermissionAction)
  action?: PermissionAction;

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
