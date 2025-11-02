import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";
import { ValidationMessage } from "src/common/enums/message.enum";

export class AddDiscountToBasketDto {
  @ApiProperty({ description: "کد تخفیف" })
  @IsString({ message: ValidationMessage.MustBeString })
  @Length(3, 20, { message: "کد تخفیف باید بین 3 تا 20 کاراکتر باشد" })
  code: string;
}
