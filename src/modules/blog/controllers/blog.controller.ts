import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  Patch,
} from "@nestjs/common";
import { BlogService } from "../services/blog.service";
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from "../dto/blog.dto";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiOperation,
} from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { SkipAuth } from "src/common/decorators/skip-auth.decorator";
import { FilterNews as FilterBlog } from "src/common/decorators/filter.decorator";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { RoleGuard } from "../../auth/guards/role.guard";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";
import { RateLimitGuard } from "src/common/guards/rate-limit.guard";

@Controller("blog")
@ApiTags("Blog")
@AuthDecorator()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post("/")
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @ApiOperation({ summary: "ایجاد پست جدید" })
  create(@Body() blogDto: CreateBlogDto) {
    return this.blogService.create(blogDto);
  }

  @Get("/my")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "دریافت پست‌های من" })
  myBlogs() {
    return this.blogService.myBlogs();
  }

  @Get("/")
  @SkipAuth()
  @Pagination()
  @FilterBlog()
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: "دریافت لیست پست‌ها" })
  find(@Query() query: PaginationDto & FilterBlogDto) {
    return this.blogService.blogList(query, query);
  }

  @Get("tags/:slug")
  @SkipAuth()
  @Pagination()
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: "دریافت پست‌ها بر اساس تگ" })
  findByTag(
    @Param("slug") slug: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.blogService.blogByTag(slug, paginationDto);
  }

  @Get(":slug")
  @SkipAuth()
  @Pagination()
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: "دریافت پست بر اساس slug" })
  findOneBySlug(
    @Param("slug") slug: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.blogService.findOneBySlug(slug, paginationDto);
  }

  @Get("/like/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "لایک/آنلایک پست" })
  likeToggle(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.likeToggle(id);
  }

  @Get("/bookmark/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "بوکمارک/آنبوکمارک پست" })
  bookmarkToggle(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.bookmarkToggle(id);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @CanAccess(Roles.Admin)
  @ApiOperation({ summary: "حذف پست" })
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.delete(id);
  }

  @Put(":id")
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @ApiOperation({ summary: "بروزرسانی پست" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() blogDto: UpdateBlogDto
  ) {
    return this.blogService.update(id, blogDto);
  }

  @Patch(":id/status")
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "تغییر وضعیت پست" })
  toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.toggleStatus(id);
  }
}
