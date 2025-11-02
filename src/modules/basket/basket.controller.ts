import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
} from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { BasketService } from "./basket.service";
import { BasketDto } from "./dto/product.dto";
import { AddDiscountToBasketDto } from "./dto/discount.dto";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { IUser } from "src/common/types/request";
import { getOrCreateGuestId, getGuestId } from "src/common/utils/guest.util";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { GuestIdCookieOptions } from "src/common/utils/cookie.util";

@Controller("basket")
@ApiTags("Basket")
export class BasketController {
  constructor(private basketService: BasketService) {}

  @Get()
  @ApiOperation({ summary: "دریافت سبد خرید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  basket(@CurrentUser() user: IUser | undefined, @Req() req: Request) {
    const userId = user?.id;
    const guestId = userId ? null : getGuestId(req);
    return this.basketService.getBasket(userId, guestId || undefined);
  }

  @Post("/add")
  @ApiOperation({ summary: "افزودن محصول به سبد خرید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  addToBasket(
    @Body() basketDto: BasketDto,
    @CurrentUser() user: IUser | undefined,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const userId = user?.id;
    let guestId = userId ? null : getGuestId(req);

    if (!userId && !guestId) {
      guestId = getOrCreateGuestId(req);
      res.cookie(CookieKeys.GuestId, guestId, GuestIdCookieOptions());
    }

    return this.basketService
      .addToBasket(basketDto, userId, guestId || undefined)
      .then((result) => {
        return res.json(result);
      });
  }

  @Post("/add-discount")
  @ApiOperation({ summary: "افزودن کد تخفیف به سبد خرید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  addDiscountToBasket(
    @Body() discountDto: AddDiscountToBasketDto,
    @CurrentUser() user: IUser | undefined,
    @Req() req: Request
  ) {
    const userId = user?.id;
    const guestId = userId ? null : getGuestId(req);
    return this.basketService.addCodeToBasket(
      discountDto,
      userId,
      guestId || undefined
    );
  }

  @Delete("/remove")
  @ApiOperation({ summary: "حذف محصول از سبد خرید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  removeFromBasket(
    @Body() basketDto: BasketDto,
    @CurrentUser() user: IUser | undefined,
    @Req() req: Request
  ) {
    const userId = user?.id;
    const guestId = userId ? null : getGuestId(req);
    return this.basketService.removeFromBasket(
      basketDto,
      userId,
      guestId || undefined
    );
  }

  @Delete("/remove/:id")
  @ApiOperation({ summary: "حذف محصول از سبد خرید با شناسه" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  removeFromBasketById(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: IUser | undefined,
    @Req() req: Request
  ) {
    const userId = user?.id;
    const guestId = userId ? null : getGuestId(req);
    return this.basketService.removeFromBasketById(
      id,
      userId,
      guestId || undefined
    );
  }

  @Delete("/clear")
  @ApiOperation({ summary: "پاک کردن سبد خرید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  clearBasket(@CurrentUser() user: IUser | undefined, @Req() req: Request) {
    const userId = user?.id;
    const guestId = userId ? null : getGuestId(req);
    return this.basketService.clearBasket(userId, guestId || undefined);
  }

  @Delete("/remove-discount")
  @ApiOperation({ summary: "حذف کد تخفیف از سبد خرید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  removeDiscountFromBasket(
    @Body() discountDto: AddDiscountToBasketDto,
    @CurrentUser() user: IUser | undefined,
    @Req() req: Request
  ) {
    const userId = user?.id;
    const guestId = userId ? null : getGuestId(req);
    return this.basketService.removeCodeFromBasket(
      discountDto,
      userId,
      guestId || undefined
    );
  }

  @Put("/update/:id")
  @ApiOperation({ summary: "بروزرسانی تعداد محصول در سبد خرید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  updateBasketCount(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: { count: number },
    @CurrentUser() user: IUser | undefined,
    @Req() req: Request
  ) {
    const userId = user?.id;
    const guestId = userId ? null : getGuestId(req);
    return this.basketService.updateBasketCount(
      id,
      updateDto,
      userId,
      guestId || undefined
    );
  }
}
