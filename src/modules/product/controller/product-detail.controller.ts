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
import { AddDetailDto, UpdateDetailDto } from "../dto/detail.dto";
import { ProductDetailService } from "../service/product-detail.service";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";

@Controller("product-detail")
@ApiTags("Product-detail")
export class ProductDetailController {
  constructor(private productDetailService: ProductDetailService) {}

  @Post()
  @ApiOperation({ summary: "ایجاد جزئیات محصول جدید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded)
  create(@Body() detailDto: AddDetailDto) {
    return this.productDetailService.create(detailDto);
  }
  @Get("/product/:productId")
  @ApiOperation({ summary: "دریافت جزئیات محصول" })
  find(@Param("productId", ParseIntPipe) productId: number) {
    return this.productDetailService.find(productId);
  }
  @Put("/:id")
  @ApiOperation({ summary: "بروزرسانی جزئیات محصول" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() detailDto: UpdateDetailDto
  ) {
    return this.productDetailService.update(id, detailDto);
  }
  @Delete("/:id")
  @ApiOperation({ summary: "حذف جزئیات محصول" })
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.productDetailService.delete(id);
  }
}
