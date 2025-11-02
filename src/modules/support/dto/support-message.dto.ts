import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  Length,
  Min,
  IsUrl,
} from "class-validator";
import { MessageType } from "../enum/support.enum";
import { ValidationMessage } from "src/common/enums/message.enum";

export class CreateSupportMessageDto {
  @ApiProperty({ description: "محتوای پیام" })
  @IsString({ message: ValidationMessage.MustBeString })
  @IsNotEmpty({ message: ValidationMessage.Required })
  @Length(1, 2000, { message: "محتوای پیام باید بین 1 تا 2000 کاراکتر باشد" })
  content: string;

  @ApiProperty({ description: "شناسه تیکت پشتیبانی" })
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  @Min(1, { message: "شناسه تیکت باید مثبت باشد" })
  ticketId: number;

  @ApiPropertyOptional({
    description: "نوع پیام",
    enum: MessageType,
    default: MessageType.Text,
  })
  @IsOptional()
  @IsEnum(MessageType, { message: "نوع پیام نامعتبر است" })
  type?: MessageType;

  @ApiPropertyOptional({ description: "آدرس فایل پیوست" })
  @IsOptional()
  @IsUrl({}, { message: "آدرس فایل نامعتبر است" })
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: "نام فایل پیوست" })
  @IsOptional()
  @IsString({ message: ValidationMessage.MustBeString })
  @Length(1, 255, { message: "نام فایل باید بین 1 تا 255 کاراکتر باشد" })
  attachmentName?: string;

  @ApiPropertyOptional({ description: "اندازه فایل پیوست (بایت)" })
  @IsOptional()
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  @Min(0, { message: "اندازه فایل نمی‌تواند منفی باشد" })
  attachmentSize?: number;
}

export class UpdateSupportMessageDto extends PartialType(
  CreateSupportMessageDto
) {
  @ApiPropertyOptional({ description: "وضعیت خوانده شدن" })
  @IsOptional()
  isRead?: boolean;
}

export class SupportMessageFilterDto {
  @ApiPropertyOptional({
    description: "فیلتر بر اساس نوع پیام",
    enum: MessageType,
  })
  @IsOptional()
  @IsEnum(MessageType, { message: "نوع پیام نامعتبر است" })
  type?: MessageType;

  @ApiPropertyOptional({ description: "فیلتر بر اساس وضعیت خوانده شدن" })
  @IsOptional()
  isRead?: boolean;

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

export class MarkAsReadDto {
  @ApiProperty({ description: "شناسه پیام" })
  @IsNumber({}, { message: ValidationMessage.MustBeNumber })
  @Min(1, { message: "شناسه پیام باید مثبت باشد" })
  messageId: number;
}
