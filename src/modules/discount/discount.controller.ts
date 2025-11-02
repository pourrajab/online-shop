import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { DiscountService } from "./discount.service";
import {
  CreateDiscountDto,
  UpdateDiscountDto,
  
} from "./dto/discount.dto";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";

@Controller("discount")
@ApiTags("Discount")
@AuthDecorator()
@ApiBearerAuth("Authorization")
export class DiscountController {
  constructor(private discountService: DiscountService) {}

  @Post()
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "ایجاد کد تخفیف جدید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() discountDto: CreateDiscountDto) {
    return this.discountService.create(discountDto);
  }

  @Get()
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "دریافت لیست کدهای تخفیف" })
  find() {
    return this.discountService.find();
  }

  @Put(":id")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "بروزرسانی کد تخفیف" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() discountDto: UpdateDiscountDto
  ) {
    return this.discountService.update(id, discountDto);
  }

  @Delete(":id")
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "حذف کد تخفیف" })
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.discountService.delete(id);
  }
}
