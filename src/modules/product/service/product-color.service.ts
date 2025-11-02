import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { ProductColor } from "../entities/product-color.entity";
import { AddColorDto, UpdateColorDto } from "../dto/color.dto";
import { ProductService } from "./product.service";
import { toBoolean } from "src/common/utils/functions.util";
import { Product } from "../entities/product.entity";
import { ProductType } from "../enum/type.enum";
import {
  NotFoundMessage,
  ConflictMessage,
  PublicMessage,
} from "src/common/enums/message.enum";

@Injectable()
export class ProductColorService {
  constructor(
    private productService: ProductService,
    @InjectRepository(ProductColor)
    private productColorRepository: Repository<ProductColor>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource
  ) {}
  async create(colorDto: AddColorDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const {
        active_discount,
        count,
        discount,
        price,
        productId,
        color_code,
        color_name,
      } = colorDto;

      let product = await queryRunner.manager.findOneBy(Product, {
        id: productId,
      });
      if (!product)
        throw new NotFoundException(NotFoundMessage.NotFoundProduct);
      if (product.type !== ProductType.Coloring)
        throw new BadRequestException(ConflictMessage.ProductTypeNotColoring);

      await queryRunner.manager.insert(ProductColor, {
        count: count || 0,
        discount: discount || 0,
        price: price || 0,
        color_code,
        color_name,
        active_discount: toBoolean(active_discount),
        productId,
      });

      if (!isNaN(parseInt(count.toString())) && +count > 0) {
        product.count =
          parseInt(product.count.toString()) + parseInt(count.toString());
        await queryRunner.manager.save(Product, product);
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return {
        message: PublicMessage.ProductColorCreated,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      console.error("Error in create color:", error);
      throw error;
    }
  }
  async update(id: number, colorDto: UpdateColorDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const {
        active_discount,
        count,
        discount,
        price,
        productId,
        color_code,
        color_name,
      } = colorDto;
      let product = await queryRunner.manager.findOneBy(Product, {
        id: productId,
      });
      if (!product)
        throw new NotFoundException(NotFoundMessage.NotFoundProduct);
      let color = await queryRunner.manager.findOneBy(ProductColor, {
        id,
      });
      if (!color)
        throw new NotFoundException(NotFoundMessage.NotFoundProductColor);
      if (color_name) color.color_name = color_name;
      if (color_code) color.color_code = color_code;
      if (active_discount) color.active_discount = toBoolean(active_discount);
      if (discount) color.discount = discount;
      if (price) color.price = price;
      let previousCount = color.count;
      if (count && !isNaN(parseInt(count.toString())) && +count > 0) {
        product.count =
          parseInt(product.count.toString()) -
          parseInt(previousCount.toString());
        product.count =
          parseInt(product.count.toString()) + parseInt(count.toString());
        color.count = count;
        await queryRunner.manager.save(Product, product);
      }
      await queryRunner.manager.save(ProductColor, color);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return {
        message: PublicMessage.ProductColorUpdated,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }
  async find(productId: number) {
    return this.productColorRepository.find({
      where: { productId },
    });
  }
  async findOne(id: number) {
    const color = await this.productColorRepository.findOneBy({ id });
    if (!color)
      throw new NotFoundException(NotFoundMessage.NotFoundProductColor);
    return color;
  }
  async delete(id: number) {
    const color = await this.findOne(id);
    if (color.count && color.count > 0) {
      const product = await this.productRepository.findOneBy({
        id: color.productId,
      });
      product.count =
        parseInt(product.count.toString()) - parseInt(color.count.toString());
      await this.productRepository.save(product);
    }
    await this.productColorRepository.delete(id);
    return {
      message: PublicMessage.ProductColorDeleted,
    };
  }
}
