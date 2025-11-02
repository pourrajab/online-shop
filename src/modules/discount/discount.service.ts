import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Discount } from "./entity/discount.entity";
import { DeepPartial, Repository } from "typeorm";
import { CreateDiscountDto, UpdateDiscountDto } from "./dto/discount.dto";
import { DiscountType } from "./type.enum";
import { ProductService } from "../product/service/product.service";
import {
  PublicMessage,
  NotFoundMessage,
  BadRequestMessage,
  ConflictMessage,
} from "src/common/enums/message.enum";

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
    private productService: ProductService
  ) {}
  async create(createDto: CreateDiscountDto) {
    const { type, amount, code, expires_in, limit, percent, productId } =
      createDto;

    let discountObject: DeepPartial<Discount> = { code };

    if (type === DiscountType.Product) {
      const product = await this.productService.findOneLean(productId);
      discountObject["productId"] = product.id;
      discountObject["type"] = DiscountType.Product;
    } else {
      discountObject["type"] = DiscountType.Basket;
    }

    if (limit && !isNaN(parseInt(limit.toString())))
      discountObject["limit"] = +limit;

    if ((amount && percent) || (!amount && !percent)) {
      throw new BadRequestException(
        BadRequestMessage.InvalidDiscountPercentOrAmount
      );
    }

    if (amount && isNaN(parseInt(amount.toString()))) {
      throw new BadRequestException(BadRequestMessage.InvalidAmountFormat);
    } else if (amount) discountObject["amount"] = +amount;
    else if (percent && isNaN(parseInt(percent.toString()))) {
      throw new BadRequestException(BadRequestMessage.InvalidPercentFormat);
    } else if (percent) discountObject["percent"] = +percent;

    if (expires_in && new Date(expires_in).toString() == "Invalid Date") {
      throw new BadRequestException(BadRequestMessage.InvalidExpiresInFormat);
    } else if (expires_in) discountObject["expires_in"] = new Date(expires_in);

    const discount = await this.getDiscountByCode(code);
    if (discount)
      throw new ConflictException(ConflictMessage.DiscountCodeAlreadyExists);

    await this.discountRepository.save(discountObject);
    return {
      message: PublicMessage.DiscountCreated,
    };
  }
  async getDiscountByCode(code: string) {
    const discount = await this.discountRepository.findOneBy({ code });
    return discount;
  }

  async find() {
    return this.discountRepository.find();
  }
  async update(id: number, updateDto: UpdateDiscountDto) {
    const discount = await this.discountRepository.findOneBy({ id });
    if (!discount)
      throw new NotFoundException(NotFoundMessage.DiscountNotFound);

    const { type, amount, code, expires_in, limit, percent, productId } =
      updateDto;

    if (type === DiscountType.Product && productId) {
      const product = await this.productService.findOneLean(productId);
      if (!product) {
        throw new NotFoundException(NotFoundMessage.NotFoundProduct);
      }
      discount.productId = product.id;
      discount.type = DiscountType.Product;
    } else if (type === DiscountType.Basket) {
      discount.type = DiscountType.Basket;
    }

    if (limit && !isNaN(parseInt(limit.toString()))) discount.limit = +limit;

    if (amount && percent) {
      throw new BadRequestException(
        BadRequestMessage.InvalidDiscountPercentOrAmount
      );
    }

    if (amount && isNaN(parseInt(amount.toString()))) {
      throw new BadRequestException(BadRequestMessage.InvalidAmountFormat);
    } else if (amount) discount.amount = +amount;
    else if (percent && isNaN(parseInt(percent.toString()))) {
      throw new BadRequestException(BadRequestMessage.InvalidPercentFormat);
    } else if (percent) discount.percent = +percent;

    if (expires_in && new Date(expires_in).toString() == "Invalid Date") {
      throw new BadRequestException(BadRequestMessage.InvalidExpiresInFormat);
    } else if (expires_in) discount.expires_in = new Date(expires_in);

    if (code) {
      const discountRow = await this.getDiscountByCode(code);
      if (discountRow && discountRow.id !== id) {
        throw new ConflictException(ConflictMessage.DiscountCodeAlreadyExists);
      }
      discount.code = code;
    }

    await this.discountRepository.save(discount);
    return {
      message: PublicMessage.DiscountUpdated,
    };
  }

  async delete(id: number) {
    const discount = await this.discountRepository.findOneBy({ id });
    if (!discount)
      throw new NotFoundException(NotFoundMessage.DiscountNotFound);

    await this.discountRepository.delete({ id });
    return {
      message: PublicMessage.DiscountDeleted,
    };
  }
}
