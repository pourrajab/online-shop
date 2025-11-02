import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from "@nestjs/common";
import { UserService } from "../services/user.service";
import { ApiConsumes, ApiTags, ApiOperation } from "@nestjs/swagger";
import {
  ChangeEmailDto,
  ChangePhoneDto,
  ChangeUsernameDto,
  ProfileDto,
} from "../dto/profile.dto";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { Response } from "express";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { CookiesOptionsToken } from "src/common/utils/cookie.util";
import { PublicMessage } from "src/common/enums/message.enum";
import { CheckOtpDto, UserBlockDto } from "../../auth/dto/auth.dto";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";
import { ChangePasswordDto, UpdateUserRoleDto } from "../dto/password.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { IUser } from "src/common/types/request";

@Controller("user")
@ApiTags("User")
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put("/profile")
  @ApiOperation({ summary: "بروزرسانی پروفایل کاربر" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  changeProfile(@Body() profileDto: ProfileDto) {
    return this.userService.changeProfile(profileDto);
  }
  @Get("/profile")
  @ApiOperation({ summary: "دریافت پروفایل کاربر" })
  profile() {
    return this.userService.profile();
  }
  @Get("/list")
  @Pagination()
  @ApiOperation({ summary: "دریافت لیست کاربران" })
  find(@Query() paginationDto: PaginationDto) {
    return this.userService.find(paginationDto);
  }

  @Patch("/change-email")
  @ApiOperation({ summary: "تغییر ایمیل" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeEmail(@Body() emailDto: ChangeEmailDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changeEmail(
      emailDto.email
    );
    if (message) return res.json({ message });
    res.cookie(CookieKeys.EmailOTP, token, CookiesOptionsToken());
    res.json({
      code,
      message: PublicMessage.SentOtp,
    });
  }
  @Post("/verify-email-otp")
  @ApiOperation({ summary: "تایید کد ایمیل" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyEmail(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyEmail(otpDto.code);
  }
  @Patch("/change-phone")
  @ApiOperation({ summary: "تغییر شماره تلفن" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changePhone(@Body() phoneDto: ChangePhoneDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changePhone(
      phoneDto.phone
    );
    if (message) return res.json({ message });
    res.cookie(CookieKeys.PhoneOTP, token, CookiesOptionsToken());
    res.json({
      code,
      message: PublicMessage.SentOtp,
    });
  }
  @Post("/verify-phone-otp")
  @ApiOperation({ summary: "تایید کد تلفن" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyPhone(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyPhone(otpDto.code);
  }
  @Post("/block")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "مسدود/رفع مسدودی کاربر" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async block(@Body() blockDto: UserBlockDto) {
    return this.userService.blockToggle(blockDto);
  }
  @Patch("/change-username")
  @ApiOperation({ summary: "تغییر نام کاربری" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeUsername(@Body() usernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(usernameDto.username);
  }

  @Patch("/change-password")
  @ApiOperation({ summary: "تغییر رمز عبور" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changePassword(@Body() body: ChangePasswordDto) {
    return this.userService.changePassword(body);
  }

  @Patch("/role")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "تغییر نقش کاربر" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updateRole(@Body() body: UpdateUserRoleDto) {
    return this.userService.updateUserRole(body);
  }

  @Get("/addresses")
  @ApiOperation({ summary: "دریافت لیست آدرس‌های کاربر" })
  async getUserAddresses(@CurrentUser() user: IUser) {
    const addresses = await this.userService.getUserAddresses(user.id);
    return {
      message: PublicMessage.AddressListFetched,
      data: addresses,
    };
  }

  @Get("/addresses/default")
  @ApiOperation({ summary: "دریافت آدرس پیش‌فرض کاربر" })
  async getDefaultAddress(@CurrentUser() user: IUser) {
    const address = await this.userService.getDefaultAddress(user.id);
    return {
      message: PublicMessage.AddressDefaultFetched,
      data: address,
    };
  }

  @Get("/statistics")
  @ApiOperation({ summary: "دریافت آمار کاربر" })
  async getUserStatistics(@CurrentUser() user: IUser) {
    const statistics = await this.userService.getUserStatistics(user.id);
    return {
      message: "آمار کاربر با موفقیت دریافت شد",
      data: statistics,
    };
  }
}
