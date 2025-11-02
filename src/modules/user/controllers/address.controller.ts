import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { PublicMessage } from "src/common/enums/message.enum";
import { AddressService } from "../services/address.service";
import { AddressDto, UpdateAddressDto } from "../dto/address.dto";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { IUser } from "src/common/types/request";

@ApiTags("Address")
@Controller("address")
@UseGuards(AuthGuard)
@ApiBearerAuth("Authorization")
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: "ایجاد آدرس جدید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async createAddress(
    @CurrentUser() user: IUser,
    @Body() addressDto: AddressDto
  ) {
    const address = await this.addressService.createAddress(
      user.id,
      addressDto
    );
    return {
      message: PublicMessage.AddressCreated,
      data: address,
    };
  }

  @Get()
  @ApiOperation({ summary: "دریافت لیست آدرس‌های کاربر" })
  async getUserAddresses(@CurrentUser() user: IUser) {
    const addresses = await this.addressService.getUserAddresses(user.id);
    return {
      message: PublicMessage.AddressListFetched,
      data: addresses,
    };
  }

  @Get("default")
  @ApiOperation({ summary: "دریافت آدرس پیش‌فرض کاربر" })
  async getDefaultAddress(@CurrentUser() user: IUser) {
    const address = await this.addressService.getDefaultAddress(user.id);
    return {
      message: PublicMessage.AddressDefaultFetched,
      data: address,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "دریافت آدرس خاص" })
  async getAddressById(
    @CurrentUser() user: IUser,
    @Param("id") id: string
  ) {
    const address = await this.addressService.getAddressById(+id, user.id);
    return {
      message: PublicMessage.AddressFetched,
      data: address,
    };
  }

  @Patch(":id")
  @ApiOperation({ summary: "بروزرسانی آدرس" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updateAddress(
    @CurrentUser() user: IUser,
    @Param("id") id: string,
    @Body() updateAddressDto: UpdateAddressDto
  ) {
    const address = await this.addressService.updateAddress(
      +id,
      user.id,
      updateAddressDto
    );
    return {
      message: PublicMessage.AddressUpdated,
      data: address,
    };
  }

  @Patch(":id/set-default")
  @ApiOperation({ summary: "تنظیم آدرس به عنوان پیش‌فرض" })
  async setDefaultAddress(
    @CurrentUser() user: IUser,
    @Param("id") id: string
  ) {
    const address = await this.addressService.setDefaultAddress(+id, user.id);
    return {
      message: PublicMessage.AddressDefaultSet,
      data: address,
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "حذف آدرس" })
  async deleteAddress(@CurrentUser() user: IUser, @Param("id") id: string) {
    await this.addressService.deleteAddress(+id, user.id);
    return { message: PublicMessage.AddressDeleted };
  }
}
