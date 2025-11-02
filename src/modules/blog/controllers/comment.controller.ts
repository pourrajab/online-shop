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
  Inject,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiOperation,
} from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { AuthMessage } from "src/common/enums/message.enum";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { RoleGuard } from "../../auth/guards/role.guard";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { BlogCommentService } from "../services/comment.service";
import { CreateCommentDto } from "../dto/comment.dto";

@Controller("blog/:blogId/comments")
@ApiTags("Blog Comments")
@ApiBearerAuth("Authorization")
@UseGuards(AuthGuard)
export class BlogCommentController {
  constructor(
    private readonly blogCommentService: BlogCommentService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Post("/")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @ApiOperation({ summary: "ایجاد کامنت جدید" })
  create(
    @Param("blogId", ParseIntPipe) blogId: number,
    @Body() commentDto: CreateCommentDto
  ) {
    return this.blogCommentService.create({ ...commentDto, blogId });
  }

  @Get("/")
  @Pagination()
  @ApiOperation({ summary: "دریافت کامنت‌های پست" })
  find(
    @Param("blogId", ParseIntPipe) blogId: number,
    @Query() paginationDto: PaginationDto
  ) {
    return this.blogCommentService.findByBlogId(blogId, paginationDto);
  }

  @Get("/my")
  @Pagination()
  @ApiOperation({ summary: "دریافت کامنت‌های من" })
  findMyComments(
    @Param("blogId", ParseIntPipe) blogId: number,
    @Query() paginationDto: PaginationDto
  ) {
    const user = this.request.user;
    if (!user) throw new BadRequestException(AuthMessage.UserNotAuthenticated);
    const userId = user.id;
    return this.blogCommentService.findCommentsForUser(
      blogId,
      userId,
      paginationDto
    );
  }

  @Put("/accept/:id")
  @ApiOperation({ summary: "تایید کامنت" })
  accept(@Param("id", ParseIntPipe) id: number) {
    return this.blogCommentService.accept(id);
  }

  @Put("/reject/:id")
  @ApiOperation({ summary: "رد کامنت" })
  reject(@Param("id", ParseIntPipe) id: number) {
    return this.blogCommentService.reject(id);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: "حذف کامنت" })
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.blogCommentService.delete(id);
  }
}
