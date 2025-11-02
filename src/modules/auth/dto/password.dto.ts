import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Length } from "class-validator";
import { ValidationMessage } from "src/common/enums/message.enum";

export class PasswordRegisterDto {
  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  username: string;

  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  @Length(8, 128, { message: ValidationMessage.PasswordTooShort })
  password: string;
}

export class PasswordLoginDto {
  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  username: string;

  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  password: string;
}
