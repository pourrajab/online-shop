import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  IsBooleanString,
} from "class-validator";
import { ValidationMessage } from "src/common/enums/message.enum";

export class CreateCategoryDto {
  @ApiProperty()
  @IsString({ message: ValidationMessage.MustBeString })
  @Length(2, 80, { message: ValidationMessage.LengthOutOfRange })
  title: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: ValidationMessage.InvalidSlug,
  })
  slug: string;

  @ApiPropertyOptional({ format: "binary", nullable: true })
  image: string;

  @ApiProperty({ type: "boolean", required: false })
  @IsOptional()
  @IsBooleanString({ message: ValidationMessage.MustBeBoolean })
  show: boolean | string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  parentId: number;
}
