import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Length } from "class-validator";
import { ValidationMessage } from "src/common/enums/message.enum";
import { SystemRoles } from "src/modules/role/enums/permission.enum";

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  currentPassword: string;

  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  @Length(8, 128, { message: ValidationMessage.PasswordTooShort })
  newPassword: string;
}

export class UpdateUserRoleDto {
  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  userId: number;

  @ApiProperty({ enum: Object.values(SystemRoles)  })
  @IsNotEmpty({ message: ValidationMessage.Required })
  role: SystemRoles;
}
