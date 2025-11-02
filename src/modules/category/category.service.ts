import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  PublicMessage,
  NotFoundMessage,
  ConflictMessage,
} from "src/common/enums/message.enum";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoryEntity } from "./entities/category.entity";
import { DeepPartial, Repository } from "typeorm";
import { createSlug } from "src/common/utils/functions.util";
import { S3Service } from "../s3/s3.service";
import { isBoolean, toBoolean } from "src/common/utils/functions.util";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.util";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    private s3Service: S3Service
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    image?: Express.Multer.File
  ) {
    const uploaded = image
      ? await this.s3Service.uploadFile(image, "category-image")
      : null;
    let { slug, title, parentId, show } = createCategoryDto;
    const category = await this.findOneBySlug(slug);
    if (category) throw new ConflictException(ConflictMessage.CategoryTitle);
    const normalizedShow: boolean = isBoolean(show)
      ? (toBoolean(show) as boolean)
      : true;
    let parent: CategoryEntity | null = null;
    if (parentId && !isNaN(parseInt(parentId.toString()))) {
      parent = await this.findOneById(+parentId);
    }
    await this.categoryRepository.insert({
      title,
      slug,
      show: normalizedShow,
      image: uploaded?.Location,
      imageKey: uploaded?.Key,
      parentId: parent?.id,
      priority: 0,
    });
    return { message: PublicMessage.Created };
  }

  async insertByTitle(title: string) {
    const category = this.categoryRepository.create({
      title,
      slug: createSlug(title),
      show: true,
      priority: 0,
    });
    return await this.categoryRepository.save(category);
  }
  async checkExistAndResolveTitle(title: string) {
    title = title?.trim()?.toLowerCase();
    const category = await this.categoryRepository.findOneBy({ title });
    if (category) throw new ConflictException(ConflictMessage.CategoryTitle);
    return title;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [categories, count] = await this.categoryRepository.findAndCount({
      where: {},
      relations: {
        parent: true,
      },
      select: {
        parent: {
          title: true,
        },
      },
      skip,
      take: limit,
      order: { id: "DESC" },
    });
    return { pagination: paginationGenerator(count, page, limit), categories };
  }

  async findAllWithoutPagination() {
    return await this.categoryRepository.find({
      order: {
        title: "ASC",
      },
    });
  }

  async findOneByTitle(title: string) {
    title = title?.trim()?.toLowerCase();
    return await this.categoryRepository.findOneBy({ title });
  }

  async findOneById(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category)
      throw new NotFoundException(NotFoundMessage.NotFoundCategory);
    return category;
  }

  async findOneBySlug(slug: string) {
    return await this.categoryRepository.findOneBy({ slug });
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    image?: Express.Multer.File
  ) {
    const { parentId, show, slug, title } = updateCategoryDto;
    const category = await this.findOneById(id);
    const updateObject: DeepPartial<CategoryEntity> = {};
    if (image) {
      const { Location, Key } = await this.s3Service.uploadFile(
        image,
        "category-image"
      );
      if (Location) {
        updateObject["image"] = Location;
        updateObject["imageKey"] = Key;
        if (category?.imageKey)
          await this.s3Service.deleteFile(category?.imageKey);
      }
    }
    if (title) updateObject["title"] = title;
    if (isBoolean(show)) updateObject["show"] = toBoolean(show) as boolean;
    if (parentId && !isNaN(parseInt(parentId.toString()))) {
      const category = await this.findOneById(+parentId);
      if (!category)
        throw new NotFoundException(NotFoundMessage.NotFoundCategory);
      updateObject["parentId"] = category.id;
    }
    if (slug) {
      const category = await this.categoryRepository.findOneBy({ slug });
      if (category && category.id !== id)
        throw new ConflictException(ConflictMessage.CategoryTitle);
      updateObject["slug"] = slug;
    }

    await this.categoryRepository.update({ id }, updateObject);
    return { message: PublicMessage.Updated };
  }

  async remove(id: number) {
    const category = await this.findOneById(id);
    await this.categoryRepository.delete({ id });
    return { message: PublicMessage.Deleted };
  }

  async findBySlug(slug: string) {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: {
        children: true,
      },
    });
    if (!category)
      throw new NotFoundException(NotFoundMessage.NotFoundCategory);
    return { category };
  }
}
