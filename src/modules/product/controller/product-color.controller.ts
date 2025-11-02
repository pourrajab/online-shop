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
import { ApiConsumes, ApiTags, ApiOperation } from "@nestjs/swagger";
import { AddColorDto, UpdateColorDto } from "../dto/color.dto";
import { ProductColorService } from "../service/product-color.service";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";

@Controller("product-color")
@ApiTags("Product-color")
export class ProductColorController {
  constructor(private productColorService: ProductColorService) {}

  @Post()
  @ApiOperation({ summary: "ایجاد رنگ محصول جدید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded)
  create(@Body() colorDto: AddColorDto) {
    return this.productColorService.create(colorDto);
  }
  @Get("/product/:productId")
  @ApiOperation({ summary: "دریافت رنگ‌های محصول" })
  find(@Param("productId", ParseIntPipe) productId: number) {
    return this.productColorService.find(productId);
  }
  @Put("/:id")
  @ApiOperation({ summary: "بروزرسانی رنگ محصول" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() colorDto: UpdateColorDto
  ) {
    return this.productColorService.update(id, colorDto);
  }
  @Delete("/:id")
  @ApiOperation({ summary: "حذف رنگ محصول" })
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.productColorService.delete(id);
  }
}
