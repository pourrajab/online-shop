import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsOptional,
  IsString,
  Length,
  IsUrl,
} from "class-validator";
import { Transform } from "class-transformer";
import { ValidationMessage } from "src/common/enums/message.enum";
import { Gender } from "../enum/gender.enum";

export class ProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" && value.trim() === "" ? undefined : value
  )
  @Length(3, 100, { message: "نام نمایشی باید حداقل 3 کاراکتر باشد" })
  nick_name: string;

  @ApiPropertyOptional({ nullable: true, enum: Gender })
  @IsOptional()
  @IsEnum(Gender, { message: ValidationMessage.InvalidEnum })
  gender: string;

  @ApiPropertyOptional({ nullable: true })
  birthday: Date;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: "شغل باید حداقل 2 کاراکتر باشد" })
  job: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(10, 10, { message: "کد ملی باید دقیقاً 10 رقم باشد" })
  national_code: string;
}
export class ChangeEmailDto {
  @ApiProperty()
  @IsEmail({}, { message: ValidationMessage.InvalidEmailFormat })
  email: string;
}
export class ChangePhoneDto {
  @ApiProperty()
  @IsMobilePhone("fa-IR", {}, { message: ValidationMessage.InvalidPhoneFormat })
  phone: string;
}
export class ChangeUsernameDto {
  @ApiProperty()
  @IsString()
  @Length(3, 100, { message: "نام کاربری باید حداقل 3 کاراکتر باشد" })
  username: string;
}
