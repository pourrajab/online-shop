import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiConsumes, ApiTags, ApiOperation } from "@nestjs/swagger";
import { AuthDto, CheckOtpDto } from "./dto/auth.dto";
import { PasswordLoginDto, PasswordRegisterDto } from "./dto/password.dto";
import { Throttle } from "@nestjs/throttler";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { Request, Response } from "express";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { CookieKeys } from "src/common/enums/cookie.enum";
import {
  CookiesOptionsToken,
  RefreshCookieOptions,
} from "src/common/utils/cookie.util";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { IUser } from "src/common/types/request";
import { BasketService } from "../basket/basket.service";
import { getGuestId } from "src/common/utils/guest.util";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly basketService: BasketService
  ) {}

  @Post("register")
  @ApiOperation({ summary: "ثبت‌نام کاربر" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  userExistence(@Body() authDto: AuthDto, @Res() res: Response) {
    console.log("[AuthController] POST /auth/register payload:", authDto);
    return this.authService.userExistence(authDto, res);
  }

  @Post("login")
  @ApiOperation({ summary: "ورود کاربر" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  userExistenceLogin(@Body() authDto: AuthDto, @Res() res: Response) {
    return this.authService.userExistence(authDto, res);
  }

  @Post("check-otp")
  @ApiOperation({ summary: "بررسی کد تایید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async checkOtp(
    @Body() checkOtpDto: CheckOtpDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const result = await this.authService.checkOtp(checkOtpDto.code);

    const guestId = getGuestId(req);
    if (guestId && result.user?.id) {
      await this.basketService.mergeGuestBasket(guestId, result.user.id);
    }

    res.cookie(
      CookieKeys.AccessToken,
      result.accessToken,
      CookiesOptionsToken()
    );
    res.cookie(
      CookieKeys.RefreshToken,
      result.refreshToken,
      RefreshCookieOptions()
    );
    res.json({
      message: result.message,
      accessToken: result.accessToken,
      user: result.user,
    });
  }

  @Post("register-password")
  @ApiOperation({ summary: "ثبت‌نام با رمز عبور" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async registerWithPassword(
    @Body() body: PasswordRegisterDto,
    @Req() req: Request
  ) {
    console.log("[AuthController] POST /auth/register-password payload:", body);
    const result = await this.authService.registerWithPassword(body);

    const guestId = getGuestId(req);
    if (guestId && result.user?.id) {
      await this.basketService.mergeGuestBasket(guestId, result.user.id);
    }

    return result;
  }

  @Post("login-password")
  @ApiOperation({ summary: "ورود با رمز عبور" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async loginWithPassword(
    @Body() body: PasswordLoginDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const result = await this.authService.loginWithPassword(body);

    const guestId = getGuestId(req);
    if (guestId && result.user?.id) {
      await this.basketService.mergeGuestBasket(guestId, result.user.id);
    }

    res.cookie(
      CookieKeys.AccessToken,
      result.accessToken,
      CookiesOptionsToken()
    );
    res.cookie(
      CookieKeys.RefreshToken,
      result.refreshToken,
      RefreshCookieOptions()
    );
    res.json({
      message: result.message,
      accessToken: result.accessToken,
      user: result.user,
    });
  }

  @Post("refresh")
  @ApiOperation({ summary: " رفرش‌توکن و صدور دسترسی جدید" })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.[CookieKeys.RefreshToken];
    const result = await this.authService.refreshTokens(refreshToken);
    res.cookie(
      CookieKeys.AccessToken,
      result.accessToken,
      CookiesOptionsToken()
    );
    res.cookie(
      CookieKeys.RefreshToken,
      result.refreshToken,
      RefreshCookieOptions()
    );
    res.json({
      message: result.message,
      accessToken: result.accessToken,
    });
  }

  @Post("logout")
  @ApiOperation({ summary: " باطل‌سازی رفرش‌توکن" })
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.[CookieKeys.RefreshToken];
    const result = await this.authService.logout(refreshToken);
    res.clearCookie(CookieKeys.AccessToken);
    res.clearCookie(CookieKeys.RefreshToken);
    res.json(result);
  }

  @Get("check-login")
  @ApiOperation({ summary: "بررسی وضعیت ورود" })
  @AuthDecorator()
  checkLogin(@CurrentUser() user: IUser) {
    return user;
  }
}
