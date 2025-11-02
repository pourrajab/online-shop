import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  Length,
  Min,
} from "class-validator";
import {
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketCategory,
} from "../enum/support.enum";
import { ValidationMessage } from "src/common/enums/message.enum";

export class CreateSupportTicketDto {
  @ApiProperty({ description: "عنوان تیکت پشتیبانی" })
  @IsString({ message: ValidationMessage.MustBeString })
  @IsNotEmpty({ message: ValidationMessage.Required })
  @Length(5, 200, { message: "عنوان باید بین 5 تا 200 کاراکتر باشد" })
  title: string;

  @ApiProperty({ description: "توضیحات تیکت پشتیبانی" })
  @IsString({ message: ValidationMessage.MustBeString })
  @IsNotEmpty({ message: ValidationMessage.Required })
  @Length(10, 2000, { message: "توضیحات باید بین 10 تا 2000 کاراکتر باشد" })
  description: string;

  @ApiPropertyOptional({
    description: "اولویت تیکت",
    enum: SupportTicketPriority,
    default: SupportTicketPriority.Medium,
  })
  @IsOptional()
  @IsEnum(SupportTicketPriority, { message: "اولویت نامعتبر است" })
  priority?: SupportTicketPriority;

  @ApiPropertyOptional({
    description: "دسته‌بندی تیکت",
    enum: SupportTicketCategory,
    default: SupportTicketCategory.General,
  })
  @IsOptional()
  @IsEnum(SupportTicketCategory, { message: "دسته‌بندی نامعتبر است" })
  category?: SupportTicketCategory;
}

export class UpdateSupportTicketDto extends PartialType(
  CreateSupportTicketDto
) {
  @ApiPropertyOptional({
    description: "وضعیت تیکت",
    enum: SupportTicketStatus,
  })
  @IsOptional()
  @IsEnum(SupportTicketStatus, { message: "وضعیت نامعتبر است" })
  status?: SupportTicketStatus;

  @ApiPropertyOptional({ description: "شناسه کاربر تخصیص داده شده" })
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  @Min(1, { message: "شناسه کاربر باید مثبت باشد" })
  assignedToId?: number;

  @ApiPropertyOptional({ description: "راه‌حل تیکت" })
  @IsOptional()
  @IsString({ message: ValidationMessage.MustBeString })
  @Length(5, 2000, { message: "راه‌حل باید بین 5 تا 2000 کاراکتر باشد" })
  resolution?: string;
}

export class SupportTicketFilterDto {
  @ApiPropertyOptional({
    description: "فیلتر بر اساس وضعیت",
    enum: SupportTicketStatus,
  })
  @IsOptional()
  @IsEnum(SupportTicketStatus, { message: "وضعیت نامعتبر است" })
  status?: SupportTicketStatus;

  @ApiPropertyOptional({
    description: "فیلتر بر اساس اولویت",
    enum: SupportTicketPriority,
  })
  @IsOptional()
  @IsEnum(SupportTicketPriority, { message: "اولویت نامعتبر است" })
  priority?: SupportTicketPriority;

  @ApiPropertyOptional({
    description: "فیلتر بر اساس دسته‌بندی",
    enum: SupportTicketCategory,
  })
  @IsOptional()
  @IsEnum(SupportTicketCategory, { message: "دسته‌بندی نامعتبر است" })
  category?: SupportTicketCategory;

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
