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
import { AddSizeDto, UpdateSizeDto } from "../dto/size.dto";
import { ProductSizeService } from "../service/product-size.service";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";

@Controller("product-size")
@ApiTags("Product-size")
export class ProductSizeController {
  constructor(private sizeService: ProductSizeService) {}

  @Post()
  @ApiOperation({ summary: "ایجاد سایز محصول جدید" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded)
  create(@Body() sizeDto: AddSizeDto) {
    return this.sizeService.create(sizeDto);
  }
  @Get("/product/:productId")
  @ApiOperation({ summary: "دریافت سایزهای محصول" })
  find(@Param("productId", ParseIntPipe) productId: number) {
    return this.sizeService.find(productId);
  }
  @Put("/:id")
  @ApiOperation({ summary: "بروزرسانی سایز محصول" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() sizeDto: UpdateSizeDto
  ) {
    return this.sizeService.update(id, sizeDto);
  }
  @Delete("/:id")
  @ApiOperation({ summary: "حذف سایز محصول" })
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.sizeService.delete(id);
  }
}
