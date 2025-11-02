import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "../entities/blog.entity";
import { DataSource, In, Repository } from "typeorm";
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from "../dto/blog.dto";
import { createSlug, randomId } from "src/common/utils/functions.util";
import { BlogStatus } from "../enum/status.enum";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import {
  BadRequestMessage,
  NotFoundMessage,
  BlogMessage,
  AuthMessage,
} from "src/common/enums/message.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.util";
import { CategoryService } from "../../category/category.service";
import { BlogCategoryEntity } from "../entities/blog-category.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BlogLikesEntity } from "../entities/like.entity";
import { BlogBookmarkEntity } from "../entities/bookmark.entity";
import { BlogCommentService } from "./comment.service";
import { TagEntity } from "../entities/tag.entity";
import { CommentsData } from "../types/comment.types";

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCategoryEntity)
    private blogCategoryRepository: Repository<BlogCategoryEntity>,
    @InjectRepository(BlogLikesEntity)
    private blogLikeRepository: Repository<BlogLikesEntity>,
    @InjectRepository(BlogBookmarkEntity)
    private blogBookmarkRepository: Repository<BlogBookmarkEntity>,
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>,
    @Inject(REQUEST) private request: Request,
    private categoryService: CategoryService,
    private blogCommentService: BlogCommentService,
    private dataSource: DataSource
  ) {}

  async create(blogDto: CreateBlogDto) {
    const user = this.request.user;
    if (!user) {
      throw new BadRequestException(AuthMessage.UserNotAuthenticated);
    }
    const { id } = user;
    let { title, slug, content, image, categoryIds = [], tags = [] } = blogDto;

    slug = createSlug(slug ?? title);

    const isExist = await this.checkBlogBySlug(slug);
    if (isExist) slug += `-${randomId()}`;

    let blog = this.blogRepository.create({
      title,
      slug,
      content,
      image,
      status: BlogStatus.Draft,
      authorId: id,
    });
    blog = await this.blogRepository.save(blog);

    const finalCategoryIds = new Set<number>();
    for (const categoryId of Array.isArray(categoryIds) ? categoryIds : []) {
      if (!categoryId && categoryId !== 0) continue;
      const category = await this.categoryService.findOneById(+categoryId);
      finalCategoryIds.add(category.id);
    }

    for (const categoryId of finalCategoryIds) {
      await this.blogCategoryRepository.insert({
        blogId: blog.id,
        categoryId: categoryId,
      });
    }
    await this.updateBlogTags(blog, tags);
    return {
      message: BlogMessage.BlogCreated,
    };
  }

  async checkBlogBySlug(slug: string) {
    const blog = await this.blogRepository.findOneBy({ slug });
    return blog;
  }

  async myBlogs() {
    const user = this.request.user;
    if (!user) {
      throw new BadRequestException(AuthMessage.UserNotAuthenticated);
    }
    const { id } = user;
    return this.blogRepository.find({
      where: {
        authorId: id,
      },
      order: {
        id: "DESC",
      },
    });
  }

  async blogList(paginationDto: PaginationDto, filterDto: FilterBlogDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    let { category, search, status, authorId, from, to } = filterDto;

    const blogQuery = this.blogRepository
      .createQueryBuilder(EntityName.Blog)
      .leftJoinAndSelect("blog.tags", "tag")
      .leftJoin("blog.author", "author")
      .addSelect(["author.username", "author.id"]);

    if (category) {
      category = category.toLowerCase();
      blogQuery.leftJoin("blog.categories", "categories");
      blogQuery.leftJoin("categories.category", "category");
      blogQuery.addSelect(["categories.id", "category.title"]);
      blogQuery.andWhere("LOWER(category.title) = :category", { category });
    }

    if (search) {
      const searchParam = `%${String(search).toLowerCase()}%`;
      blogQuery.andWhere(
        "LOWER(CONCAT(COALESCE(blog.title,''), ' ', COALESCE(blog.content,''))) LIKE :search",
        { search: searchParam }
      );
    }

    if (status) {
      blogQuery.andWhere("blog.status = :status", { status });
    }

    if (authorId) {
      blogQuery.andWhere("blog.authorId = :authorId", { authorId: +authorId });
    }

    if (from) {
      blogQuery.andWhere("blog.created_at >= :from", { from: new Date(from) });
    }

    if (to) {
      blogQuery.andWhere("blog.created_at <= :to", { to: new Date(to) });
    }

    blogQuery
      .loadRelationCountAndMap("blog.likesCount", "blog.likes")
      .loadRelationCountAndMap("blog.bookmarksCount", "blog.bookmarks")
      .loadRelationCountAndMap(
        "blog.commentsCount",
        "blog.comments",
        "comments",
        (commentQuery) =>
          commentQuery.where("comments.accepted = :accepted", {
            accepted: true,
          })
      )
      .orderBy("blog.id", "DESC")
      .skip(skip)
      .take(limit);

    try {
      const [items, count] = await blogQuery.getManyAndCount();
      return {
        pagination: paginationGenerator(count, page, limit),
        blogs: items,
      };
    } catch (error) {
      console.error("BlogService.blogList error:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
  }

  async checkExistBlogById(id: number) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) throw new NotFoundException(NotFoundMessage.NotFoundPost);
    return blog;
  }

  async delete(id: number) {
    await this.checkExistBlogById(id);
    await this.blogRepository.delete({ id });
    return {
      message: BlogMessage.BlogDeleted,
    };
  }

  async update(id: number, blogDto: UpdateBlogDto) {
    const user = this.request.user;
    if (!user) {
      throw new BadRequestException(AuthMessage.UserNotAuthenticated);
    }
    const { id: userId } = user;
    let { title, slug, content, image, categoryIds = [], tags } = blogDto;
    const blog = await this.checkExistBlogById(id);
    let slugData = null as string | null;
    if (title) {
      slugData = title;
      blog.title = title;
    }
    if (slug) slugData = slug;
    if (slugData) {
      slug = createSlug(slugData);
      const isExist = await this.checkBlogBySlug(slug);
      if (isExist && isExist.id !== id) {
        slug += `-${randomId()}`;
      }
      blog.slug = slug;
    }
    if (content) blog.content = content;
    if (image) blog.image = image;
    await this.blogRepository.save(blog);

    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      await this.blogCategoryRepository.delete({ blogId: blog.id });
      const finalCategoryIds = new Set<number>();
      for (const categoryId of categoryIds) {
        if (!categoryId && categoryId !== 0) continue;
        const category = await this.categoryService.findOneById(+categoryId);
        finalCategoryIds.add(category.id);
      }
      for (const categoryId of finalCategoryIds) {
        await this.blogCategoryRepository.insert({
          blogId: blog.id,
          categoryId: categoryId,
        });
      }
    }

    if (tags) {
      await this.updateBlogTags(blog, tags);
    }
    return {
      message: BlogMessage.BlogUpdated,
    };
  }

  protected async updateBlogTags(blog: BlogEntity, tags: string[]) {
    if (!Array.isArray(tags)) return;

    const uniqueTitles = Array.from(
      new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))
    );

    const existingTags = await this.tagRepository.find({
      where: { slug: In(uniqueTitles.map((t) => createSlug(t))) },
    });

    const newTags: TagEntity[] = [];

    for (const title of uniqueTitles) {
      const slug = createSlug(title);
      let tag = existingTags.find((t) => t.slug === slug);
      if (!tag) {
        tag = this.tagRepository.create({ title, slug });
        tag = await this.tagRepository.save(tag);
      }
      newTags.push(tag);
    }

    blog.tags = newTags;
    await this.blogRepository.save(blog);
  }

  async listTags() {
    return this.tagRepository.find({ order: { title: "ASC" } });
  }

  async likeToggle(blogId: number) {
    const user = this.request.user;
    if (!user) {
      throw new BadRequestException(AuthMessage.UserNotAuthenticated);
    }
    const { id: userId } = user;
    await this.checkExistBlogById(blogId);
    const isLiked = await this.blogLikeRepository.findOneBy({
      userId,
      blogId,
    });
    let message = BlogMessage.BlogLiked;
    if (isLiked) {
      await this.blogLikeRepository.delete({ id: isLiked.id });
      message = BlogMessage.BlogUnliked;
    } else {
      await this.blogLikeRepository.insert({
        blogId,
        userId,
      });
    }
    return { message };
  }

  async bookmarkToggle(blogId: number) {
    const user = this.request.user;
    if (!user) {
      throw new BadRequestException(AuthMessage.UserNotAuthenticated);
    }
    const { id: userId } = user;
    const item = await this.checkExistBlogById(blogId);
    const isBookmarked = await this.blogBookmarkRepository.findOneBy({
      userId,
      blogId,
    });
    let message = BlogMessage.BlogBookmarked;
    if (isBookmarked) {
      await this.blogBookmarkRepository.delete({ id: isBookmarked.id });
      message = BlogMessage.BlogUnbookmarked;
    } else {
      await this.blogBookmarkRepository.insert({
        blogId,
        userId,
      });
    }
    return { message };
  }

  async toggleStatus(id: number) {
    const blogItem = await this.checkExistBlogById(id);
    const newBlogStatus =
      blogItem.status === BlogStatus.Published
        ? BlogStatus.Draft
        : BlogStatus.Published;
    blogItem.status = newBlogStatus;
    await this.blogRepository.save(blogItem);
    return {
      message: BlogMessage.BlogStatusChanged,
      status: newBlogStatus,
    };
  }

  async findOneBySlug(slug: string, paginationDto: PaginationDto) {
    const user = this.request?.user;
    const userId = user?.id;

    let blogItem: BlogEntity | null = null;
    try {
      blogItem = await this.blogRepository
        .createQueryBuilder(EntityName.Blog)
        .leftJoin("blog.categories", "categories")
        .leftJoin("categories.category", "category")
        .leftJoin("blog.author", "author")
        .leftJoin("author.profile", "profile")
        .leftJoinAndSelect("blog.tags", "tag")
        .addSelect([
          "categories.id",
          "category.title",
          "author.username",
          "author.id",
          "profile.nick_name",
        ])
        .where("blog.slug = :slug", { slug })
        .loadRelationCountAndMap("blog.likesCount", "blog.likes")
        .loadRelationCountAndMap("blog.bookmarksCount", "blog.bookmarks")
        .getOne();
    } catch (error) {
      console.error("BlogService.findOneBySlug query error:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }

    if (!blogItem) {
      console.warn("BlogService.findOneBySlug not found:", { slug });
      throw new NotFoundException(NotFoundMessage.NotFoundPost);
    }

    let commentsData: CommentsData;
    try {
      commentsData = await this.blogCommentService.findCommentsOfBlog(
        blogItem.id,
        paginationDto
      );
    } catch (error) {
      console.error("BlogService.findOneBySlug comments error:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }

    let isLiked = false;
    let isBookmarked = false;
    if (userId && !isNaN(userId) && userId > 0) {
      isLiked = !!(await this.blogLikeRepository.findOneBy({
        userId,
        blogId: blogItem.id,
      }));
      isBookmarked = !!(await this.blogBookmarkRepository.findOneBy({
        userId,
        blogId: blogItem.id,
      }));
    }

    let suggestBlogs: BlogEntity[] = [];
    try {
      suggestBlogs = await this.blogRepository
        .createQueryBuilder("blog")
        .leftJoin("blog.author", "author")
        .leftJoin("author.profile", "profile")
        .leftJoin("blog.categories", "categories")
        .leftJoin("categories.category", "category")
        .leftJoin("blog.tags", "tag")
        .addSelect([
          "author.username",
          "author.id",
          "profile.nick_name",
          "category.title",
          "tag.slug",
          "tag.title",
        ])
        .where("blog.status = :pubStatus", { pubStatus: BlogStatus.Published })
        .andWhere("blog.id != :currentId", { currentId: blogItem.id })
        .orderBy("RAND()")
        .take(3)
        .getMany();
    } catch (error) {
      console.error("BlogService.findOneBySlug suggestBlogs error:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }

    return {
      blog: blogItem,
      isLiked,
      isBookmarked,
      commentsData,
      tags: blogItem.tags,
      suggestBlogs,
    };
  }

  async blogByTag(slug: string, paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);

    try {
      const [items, count] = await this.blogRepository
        .createQueryBuilder("blog")
        .innerJoin("blog.tags", "tag")
        .leftJoin("blog.categories", "categories")
        .leftJoin("categories.category", "category")
        .leftJoin("blog.author", "author")
        .leftJoin("author.profile", "profile")
        .addSelect([
          "categories.id",
          "category.title",
          "author.username",
          "author.id",
          "profile.nick_name",
          "tag.id",
          "tag.title",
          "tag.slug",
        ])
        .where("tag.slug = :slug", { slug })
        .loadRelationCountAndMap("blog.likesCount", "blog.likes")
        .loadRelationCountAndMap("blog.bookmarksCount", "blog.bookmarks")
        .orderBy("blog.id", "DESC")
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        pagination: paginationGenerator(count, page, limit),
        blogs: items,
      };
    } catch (error) {
      console.error("BlogService.blogByTag error:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
  }
}
