import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "../entities/product.entity";
import { ProductColor } from "../entities/product-color.entity";
import { ProductSize } from "../entities/product-size.entity";
import { ProductDetail } from "../entities/product-detail.entity";
import { ProductImage } from "../entities/product-image.entity";
import { CategoryEntity } from "../../category/entities/category.entity";
import { CreateProductDto, UpdateProductDto } from "../dto/product.dto";
import { ProductType } from "../enum/type.enum";
import { S3Service } from "../../s3/s3.service";
import {
  PublicMessage,
  NotFoundMessage,
  ConflictMessage,
  ValidationMessage,
} from "src/common/enums/message.enum";
import { createSlug } from "src/common/utils/functions.util";

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(ProductColor)
    private productColorRepository: Repository<ProductColor>,
    @InjectRepository(ProductSize)
    private productSizeRepository: Repository<ProductSize>,
    @InjectRepository(ProductDetail)
    private productDetailRepository: Repository<ProductDetail>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    private s3Service: S3Service
  ) {}

  async create(
    createProductDto: CreateProductDto,
    images?: Express.Multer.File[]
  ) {
    const {
      title,
      content,
      slug,
      code,
      type,
      count,
      price,
      discount,
      active_discount,
      categoryId,
    } = createProductDto;

    const finalSlug = slug || createSlug(title);

    const existingProduct = await this.productRepository.findOneBy({
      slug: finalSlug,
    });
    if (existingProduct) {
      throw new ConflictException(ConflictMessage.ProductSlugExists);
    }

    const existingCode = await this.productRepository.findOneBy({ code });
    if (existingCode) {
      throw new ConflictException(ConflictMessage.ProductCodeExists);
    }

    if (!Object.values(ProductType).includes(type as ProductType)) {
      throw new BadRequestException(ValidationMessage.InvalidProductType);
    }

    if (categoryId) {
      const category = await this.categoryRepository.findOneBy({
        id: categoryId,
      });
      if (!category) {
        throw new NotFoundException(NotFoundMessage.NotFoundCategory);
      }
    }

    const product = this.productRepository.create({
      title,
      content,
      slug: finalSlug,
      code,
      type: type as ProductType,
      count,
      price,
      discount: discount || 0,
      active_discount: active_discount || false,
      categoryId: categoryId || null,
    });

    const savedProduct = await this.productRepository.save(product);

    if (images && images.length > 0) {
      const imagePromises = images.map(async (image, index) => {
        const uploadedImage = await this.s3Service.uploadFile(
          image,
          "product-images"
        );
        return this.productImageRepository.create({
          productId: savedProduct.id,
          url: uploadedImage.Location,
          key: uploadedImage.Key,
          sort: index,
        });
      });

      const productImages = await Promise.all(imagePromises);
      await this.productImageRepository.save(productImages);
    }

    return {
      message: PublicMessage.Created,
      product: savedProduct,
    };
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    images?: Express.Multer.File[]
  ) {
    const product = await this.findOne(id);
    const {
      title,
      content,
      slug,
      code,
      type,
      count,
      price,
      discount,
      active_discount,
      categoryId,
    } = updateProductDto;

    if (slug && slug !== product.slug) {
      const existingProduct = await this.productRepository.findOneBy({ slug });
      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException(ConflictMessage.ProductSlugExists);
      }
    }

    if (code && code !== product.code) {
      const existingCode = await this.productRepository.findOneBy({ code });
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException(ConflictMessage.ProductCodeExists);
      }
    }

    if (type && !Object.values(ProductType).includes(type as ProductType)) {
      throw new BadRequestException(ValidationMessage.InvalidProductType);
    }

    if (categoryId) {
      const category = await this.categoryRepository.findOneBy({
        id: categoryId,
      });
      if (!category) {
        throw new NotFoundException(NotFoundMessage.NotFoundCategory);
      }
    }

    Object.assign(product, {
      title: title || product.title,
      content: content || product.content,
      slug: slug || product.slug,
      code: code || product.code,
      type: type || product.type,
      count: count !== undefined ? count : product.count,
      price: price !== undefined ? price : product.price,
      discount: discount !== undefined ? discount : product.discount,
      active_discount:
        active_discount !== undefined
          ? active_discount
          : product.active_discount,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
    });

    const updatedProduct = await this.productRepository.save(product);

    if (images && images.length > 0) {
      const imagePromises = images.map(async (image, index) => {
        const uploadedImage = await this.s3Service.uploadFile(
          image,
          "product-images"
        );
        return this.productImageRepository.create({
          productId: updatedProduct.id,
          url: uploadedImage.Location,
          key: uploadedImage.Key,
          sort: index,
        });
      });

      const productImages = await Promise.all(imagePromises);
      await this.productImageRepository.save(productImages);
    }

    return {
      message: PublicMessage.Updated,
      product: updatedProduct,
    };
  }

  async find(query?: {
    name?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    categoryId?: string | number;
    sort?: string;
    page?: string | number;
    limit?: string | number;
  }) {
    const {
      name,
      minPrice,
      maxPrice,
      categoryId,
      sort = "-created_at",
      page = 1,
      limit = 10,
    } = query || {};

    const qb = this.productRepository.createQueryBuilder("p");

    if (name) qb.andWhere("p.title LIKE :name", { name: `%${name}%` });
    if (!isNaN(parseFloat(minPrice as string)))
      qb.andWhere("p.price >= :minPrice", { minPrice: +minPrice });
    if (!isNaN(parseFloat(maxPrice as string)))
      qb.andWhere("p.price <= :maxPrice", { maxPrice: +maxPrice });
    if (!isNaN(parseInt(categoryId as string)))
      qb.andWhere("p.categoryId = :categoryId", { categoryId: +categoryId });

    const order: Record<string, "ASC" | "DESC"> = {};
    if (sort?.startsWith("-")) order[sort.slice(1)] = "DESC";
    else if (sort) order[sort] = "ASC";
    qb.orderBy(order);
    qb.skip((+page - 1) * +limit).take(+limit);

    const [items, count] = await qb.getManyAndCount();
    return {
      pagination: { page: +page, limit: +limit, total: count },
      products: items,
    };
  }

  async findOneLean(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    if (!product) throw new NotFoundException(NotFoundMessage.NotFoundProduct);
    return product;
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { colors: true, sizes: true, details: true, images: true },
    });
    if (!product) throw new NotFoundException(NotFoundMessage.NotFoundProduct);
    return product;
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.productRepository.delete({ id });
    return {
      message: PublicMessage.Deleted,
    };
  }
}
