import { ApiProperty } from "@nestjs/swagger";
import { AuthType } from "../enums/type.enum";
import { IsEnum, IsString, Length } from "class-validator";
import { OtpAuthMethod } from "../enums/otp-method.enum";
import { ValidationMessage } from "src/common/enums/message.enum";

export class AuthDto {
  @ApiProperty()
  @IsString({ message: ValidationMessage.MustBeString })
  @Length(3, 100, { message: ValidationMessage.LengthOutOfRange })
  username: string;
  @ApiProperty({ enum: AuthType })
  @IsEnum(AuthType)
  type: string;
  @ApiProperty({ enum: OtpAuthMethod })
  @IsEnum(OtpAuthMethod)
  method: OtpAuthMethod;
}

export class CheckOtpDto {
  @ApiProperty()
  @IsString({ message: ValidationMessage.MustBeString })
  @Length(5, 5, { message: "کد تایید باید دقیقاً 5 رقم باشد" })
  code: string;
}
export class UserBlockDto {
  @ApiProperty()
  userId: number;
}
