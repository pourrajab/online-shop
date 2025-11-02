import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "../entities/blog.entity";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { BlogCommentEntity } from "../entities/comment.entity";
import { BlogService } from "./blog.service";
import {
  NotFoundMessage,
  BlogMessage,
  AuthMessage,
} from "src/common/enums/message.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.util";
import { CreateCommentDto } from "../dto/comment.dto";
import { CommentsData } from "../types/comment.types";

@Injectable({ scope: Scope.REQUEST })
export class BlogCommentService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCommentEntity)
    private blogCommentRepository: Repository<BlogCommentEntity>,
    @Inject(REQUEST) private request: Request,
    @Inject(forwardRef(() => BlogService)) private blogService: BlogService
  ) {}

  async create(commentDto: CreateCommentDto & { blogId: number }) {
    const { parentId, text, blogId } = commentDto;
    const user = this.request.user;
    if (!user) {
      throw new BadRequestException(AuthMessage.UserNotAuthenticated);
    }
    const { id: userId } = user;
    const blog = await this.blogService.checkExistBlogById(blogId);
    let parent = null;
    if (parentId && !isNaN(Number(parentId))) {
      parent = await this.blogCommentRepository.findOneBy({ id: +parentId });
    }
    await this.blogCommentRepository.insert({
      text,
      accepted: false,
      blogId,
      parentId: parent ? Number(parentId) : null,
      userId,
    });
    return {
      message: BlogMessage.CommentCreated,
    };
  }

  async find(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [comments, count] = await this.blogCommentRepository.findAndCount({
      where: { accepted: true },
      order: { id: "DESC" },
      take: limit,
      skip,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      comments,
    };
  }

  async findByBlogId(blogId: number, paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [comments, count] = await this.blogCommentRepository.findAndCount({
      where: { accepted: true, blogId },
      order: { id: "DESC" },
      take: limit,
      skip,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      comments,
    };
  }

  async findCommentsForUser(
    blogId: number,
    userId: number,
    paginationDto: PaginationDto
  ) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [comments, count] = await this.blogCommentRepository.findAndCount({
      where: { blogId, userId },
      order: { id: "DESC" },
      take: limit,
      skip,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      comments,
    };
  }

  async accept(id: number) {
    const comment = await this.blogCommentRepository.findOneBy({ id });
    if (!comment) throw new NotFoundException(NotFoundMessage.NotFound);

    const user = this.request.user;
    if (!user) throw new ForbiddenException();
    const role = String(user.role || "").toLowerCase();
    const isAdminOrSuperadmin = role === "admin" || role === "superadmin";
    const blog = await this.blogRepository.findOneBy({ id: comment.blogId });
    const isBlogAuthor = !!blog && blog.authorId === user.id;
    if (!(isAdminOrSuperadmin || isBlogAuthor)) {
      throw new ForbiddenException();
    }

    comment.accepted = true;
    await this.blogCommentRepository.save(comment);
    return { message: BlogMessage.CommentAccepted };
  }

  async reject(id: number) {
    const comment = await this.blogCommentRepository.findOneBy({ id });
    if (!comment) throw new NotFoundException(NotFoundMessage.NotFound);

    const user = this.request.user;
    if (!user) throw new ForbiddenException();
    const role = String(user.role || "").toLowerCase();
    const isAdminOrSuperadmin = role === "admin" || role === "superadmin";
    const blog = await this.blogRepository.findOneBy({ id: comment.blogId });
    const isBlogAuthor = !!blog && blog.authorId === user.id;
    if (!(isAdminOrSuperadmin || isBlogAuthor)) {
      throw new ForbiddenException();
    }

    comment.accepted = false;
    await this.blogCommentRepository.save(comment);
    return { message: BlogMessage.CommentRejected };
  }

  async delete(id: number) {
    const comment = await this.blogCommentRepository.findOneBy({ id });
    if (!comment) throw new NotFoundException(NotFoundMessage.NotFound);
    const user = this.request.user;
    if (!user) throw new ForbiddenException();
    const role = String(user.role || "").toLowerCase();
    const isAdminOrSuperadmin = role === "admin" || role === "superadmin";
    const isCommentAuthor = comment.userId === user.id;
    const blog = await this.blogRepository.findOneBy({ id: comment.blogId });
    const isBlogAuthor = !!blog && blog.authorId === user.id;
    if (!(isAdminOrSuperadmin || isCommentAuthor || isBlogAuthor)) {
      throw new ForbiddenException();
    }
    await this.blogCommentRepository.delete({ id });
    return { message: BlogMessage.CommentDeleted };
  }

  async findCommentsOfBlog(
    blogId: number,
    paginationDto: PaginationDto
  ): Promise<CommentsData> {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [comments, count] = await this.blogCommentRepository.findAndCount({
      where: { blogId, accepted: true },
      order: { id: "DESC" },
      take: limit,
      skip,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      comments,
    };
  }
}
