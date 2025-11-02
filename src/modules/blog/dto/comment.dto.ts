import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { ValidationMessage } from "src/common/enums/message.enum";

export class CreateCommentDto {
  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.Required })
  @IsString({ message: ValidationMessage.MustBeString })
  @Length(1, 500, { message: ValidationMessage.LengthOutOfRangeComment })
  text: string;

  @ApiPropertyOptional()
  @IsOptional()
  parentId?: number;
}
