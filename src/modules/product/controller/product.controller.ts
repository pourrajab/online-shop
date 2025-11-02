import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
  Query,
} from "@nestjs/common";
import { ApiConsumes, ApiTags, ApiOperation } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { CreateProductDto, UpdateProductDto } from "../dto/product.dto";
import { ProductService } from "../service/product.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import * as multer from "multer";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";

@Controller("product")
@ApiTags("Product")
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "ایجاد محصول جدید" })
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @UseInterceptors(
    FilesInterceptor("images", 10, {
      storage: multer.memoryStorage(),
    })
  )
  create(
    @Body() productDto: CreateProductDto,
    @UploadedFiles() images?: Express.Multer.File[]
  ) {
    return this.productService.create(productDto, images);
  }
  @Get()
  @ApiOperation({ summary: "دریافت لیست محصولات" })
  find(
    @Query()
    query?: {
      name?: string;
      minPrice?: string | number;
      maxPrice?: string | number;
      categoryId?: string | number;
      sort?: string;
      page?: string | number;
      limit?: string | number;
    }
  ) {
    return this.productService.find(query);
  }
  @Get(":id")
  @ApiOperation({ summary: "دریافت محصول بر اساس آیدی" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }
  @Put("/:id")
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "بروزرسانی محصول" })
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @UseInterceptors(
    FilesInterceptor("images", 10, {
      storage: multer.memoryStorage(),
    })
  )
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() productDto: UpdateProductDto,
    @UploadedFiles() images?: Express.Multer.File[]
  ) {
    return this.productService.update(id, productDto, images);
  }
  @Delete("/:id")
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "حذف محصول" })
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.productService.delete(id);
  }
}
