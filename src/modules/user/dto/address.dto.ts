import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, Length, IsMobilePhone } from "class-validator";
import { Transform } from "class-transformer";
import {
  AddressMessage,
  ValidationMessage,
} from "src/common/enums/message.enum";

export class AddressDto {
  @ApiProperty({ description: "استان" })
  @IsString()
  @Length(2, 50, { message: AddressMessage.ProvinceTooShort })
  province: string;

  @ApiProperty({ description: "شهر" })
  @IsString()
  @Length(2, 50, { message: AddressMessage.CityTooShort })
  city: string;

  @ApiProperty({ description: "نام گیرنده" })
  @IsString()
  @Length(2, 100, { message: AddressMessage.RecipientTooShort })
  recipient_name: string;

  @ApiProperty({ description: "جزئیات آدرس" })
  @IsString()
  @Length(10, 200, { message: AddressMessage.AddressDetailsTooShort })
  address_details: string;

  @ApiProperty({ description: "پلاک" })
  @IsString()
  @Length(1, 20, { message: AddressMessage.PlaqueTooShort })
  plaque: string;

  @ApiProperty({ description: "کد پستی" })
  @IsString()
  @Length(10, 10, { message: AddressMessage.PostalCodeLength })
  postal_code: string;

  @ApiPropertyOptional({ description: "شماره تماس دوم (اختیاری)" })
  @IsOptional()
  @IsMobilePhone("fa-IR", {}, { message: ValidationMessage.InvalidPhoneFormat })
  secondary_phone: string;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ description: "استان" })
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: AddressMessage.ProvinceTooShort })
  province: string;

  @ApiPropertyOptional({ description: "شهر" })
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: AddressMessage.CityTooShort })
  city: string;

  @ApiPropertyOptional({ description: "نام گیرنده" })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: AddressMessage.RecipientTooShort })
  recipient_name: string;

  @ApiPropertyOptional({ description: "جزئیات آدرس" })
  @IsOptional()
  @IsString()
  @Length(10, 200, { message: AddressMessage.AddressDetailsTooShort })
  address_details: string;

  @ApiPropertyOptional({ description: "پلاک" })
  @IsOptional()
  @IsString()
  @Length(1, 20, { message: AddressMessage.PlaqueTooShort })
  plaque: string;

  @ApiPropertyOptional({ description: "کد پستی" })
  @IsOptional()
  @IsString()
  @Length(10, 10, { message: AddressMessage.PostalCodeLength })
  postal_code: string;

  @ApiPropertyOptional({ description: "شماره تماس دوم (اختیاری)" })
  @IsOptional()
  @IsMobilePhone("fa-IR", {}, { message: ValidationMessage.InvalidPhoneFormat })
  secondary_phone: string;
}
