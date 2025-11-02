import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ApiConsumes, ApiTags, ApiOperation } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import * as multer from "multer";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";

@ApiTags("Category")
@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "ایجاد دسته‌بندی جدید" })
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: multer.memoryStorage(),
    })
  )
  async create(
    @Body() body: CreateCategoryDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    return this.categoryService.create(body, image);
  }

  @Get()
  @Pagination()
  @ApiOperation({ summary: "دریافت لیست دسته‌بندی‌ها" })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "دریافت دسته‌بندی بر اساس آیدی" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.categoryService.findOneById(id);
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "دریافت دسته‌بندی بر اساس اسلاگ" })
  async findBySlug(@Param("slug") slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Patch(":id")
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "بروزرسانی دسته‌بندی" })
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: multer.memoryStorage(),
    })
  )
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateCategoryDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    return this.categoryService.update(id, body, image);
  }

  @Delete(":id")
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "حذف دسته‌بندی" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
