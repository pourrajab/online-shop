import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { DiscountService } from "../discount/discount.service";
import { Discount } from "../discount/entity/discount.entity";
import { DiscountType } from "../discount/type.enum";
import { ProductColor } from "../product/entities/product-color.entity";
import { ProductSize } from "../product/entities/product-size.entity";
import { ProductType } from "../product/enum/type.enum";
import { ProductColorService } from "../product/service/product-color.service";
import { ProductSizeService } from "../product/service/product-size.service";
import { ProductService } from "../product/service/product.service";
import { AddDiscountToBasketDto } from "./dto/discount.dto";
import { BasketDto } from "./dto/product.dto";
import { Basket } from "./entity/basket.entity";
import {
  PublicMessage,
  NotFoundMessage,
  ConflictMessage,
  BadRequestMessage,
} from "src/common/enums/message.enum";

@Injectable()
export class BasketService {
  constructor(
    @InjectRepository(Basket) private basketRepository: Repository<Basket>,
    private productService: ProductService,
    private productColorService: ProductColorService,
    private productSizeService: ProductSizeService,
    private discountService: DiscountService
  ) {}

  async getBasket(userId?: number, guestId?: string) {
    const where: FindOptionsWhere<Basket> = {};
    if (userId) {
      where.userId = userId;
    } else if (guestId) {
      where.guestId = guestId;
    } else {
      return {
        totalPrice: 0,
        finalAmount: 0,
        totalDiscountAmount: 0,
        productDiscounts: [],
        products: [],
        discounts: [],
      };
    }

    const items = await this.basketRepository.find({
      where,
      relations: {
        product: true,
        color: true,
        size: true,
        discount: true,
      },
    });
    let products = [];
    let discounts = [];
    let finalAmount = 0;
    let totalPrice = 0;
    let totalDiscountAmount = 0;
    const productDiscounts = items.filter(
      (item) =>
        item?.discountId && item?.discount?.type === DiscountType.Product
    );
    for (const item of items) {
      const { product, color, size, discount, count } = item;
      let discountAmount = 0;
      if (product?.type === ProductType.Single) {
        totalPrice += +product.price;
        if (product?.active_discount) {
          const { newDiscountAmount, newPrice } = this.checkDiscountPercent(
            +product.price,
            +product.discount
          );
          discountAmount = newDiscountAmount;
          product.price = newPrice;
          totalDiscountAmount += discountAmount;
        }
        const existDiscount = productDiscounts.find(
          (dis) => dis.productId === product.id
        );
        if (existDiscount) {
          const { discount } = existDiscount;
          if (this.validateDiscount(discount)) {
            discounts.push({
              percent: discount.percent,
              amount: discount.amount,
              code: discount.code,
              type: discount.type,
              productId: discount.productId,
            });
            if (discount.percent) {
              const { newDiscountAmount, newPrice } = this.checkDiscountPercent(
                product.price,
                discount.percent
              );
              product.price = newPrice;
              discountAmount += newDiscountAmount;
            } else if (discount.amount) {
              const { newDiscountAmount, newPrice } = this.checkDiscountAmount(
                product.price,
                discount.amount
              );
              product.price = newPrice;
              discountAmount += newDiscountAmount;
            }
            totalDiscountAmount += discountAmount;
          }
        }
        finalAmount += +product.price * count;
        products.push({
          id: product.id,
          slug: product.slug,
          title: product.title,
          active_discount: product.active_discount,
          discount: product.discount,
          price: product.price,
          count: count,
        });
      } else if (product?.type === ProductType.Sizing) {
        totalPrice += +size.price;
        if (size?.active_discount) {
          const { newDiscountAmount, newPrice } = this.checkDiscountPercent(
            +size.price,
            +size.discount
          );
          discountAmount = newDiscountAmount;
          size.price = newPrice;
        }
        const existDiscount = productDiscounts.find(
          (dis) => dis.productId === product.id
        );
        if (existDiscount) {
          const { discount } = existDiscount;
          if (this.validateDiscount(discount)) {
            discounts.push({
              percent: discount.percent,
              amount: discount.amount,
              code: discount.code,
              type: discount.type,
              productId: discount.productId,
            });
            if (discount.percent) {
              const { newDiscountAmount, newPrice } = this.checkDiscountPercent(
                size.price,
                discount.percent
              );
              size.price = newPrice;
              discountAmount += newDiscountAmount;
            } else if (discount.amount) {
              const { newDiscountAmount, newPrice } = this.checkDiscountAmount(
                size.price,
                discount.amount
              );
              size.price = newPrice;
              discountAmount += newDiscountAmount;
            }
          }
        }
        totalDiscountAmount += discountAmount;
        finalAmount += +size.price * count;
        products.push({
          id: product.id,
          slug: product.slug,
          title: product.title,
          active_discount: size.active_discount,
          discount: size.discount,
          sizeId: size.id,
          price: size.price,
          size: size.size,
          count: count,
        });
      } else if (product?.type === ProductType.Coloring) {
        totalPrice += +color.price;
        if (color?.active_discount) {
          const { newDiscountAmount, newPrice } = this.checkDiscountPercent(
            +color.price,
            +color.discount
          );
          discountAmount = newDiscountAmount;
          color.price = newPrice;
        }
        const existDiscount = productDiscounts.find(
          (dis) => dis.productId === product.id
        );
        if (existDiscount) {
          const { discount } = existDiscount;
          if (this.validateDiscount(discount)) {
            discounts.push({
              percent: discount.percent,
              amount: discount.amount,
              code: discount.code,
              type: discount.type,
              productId: discount.productId,
            });
            if (discount.percent) {
              const { newDiscountAmount, newPrice } = this.checkDiscountPercent(
                color.price,
                discount.percent
              );
              color.price = newPrice;
              discountAmount += newDiscountAmount;
            } else if (discount.amount) {
              const { newDiscountAmount, newPrice } = this.checkDiscountAmount(
                color.price,
                discount.amount
              );
              color.price = newPrice;
              discountAmount += newDiscountAmount;
            }
          }
        }
        totalDiscountAmount += discountAmount;
        finalAmount += +color.price * count;
        products.push({
          id: product.id,
          slug: product.slug,
          title: product.title,
          active_discount: color.active_discount,
          discount: color.discount,
          price: color.price,
          colorId: color.id,
          color_code: color.color_code,
          color_name: color.color_name,
          count: count,
        });
      }
    }

    const basketDiscounts = items.filter(
      (item) => item?.discountId && item?.discount?.type === DiscountType.Basket
    );

    for (const item of basketDiscounts) {
      const { discount } = item;
      if (this.validateDiscount(discount)) {
        discounts.push({
          percent: discount.percent,
          amount: discount.amount,
          code: discount.code,
          type: discount.type,
          productId: discount.productId,
        });

        if (discount.percent) {
          const { newDiscountAmount, newPrice } = this.checkDiscountPercent(
            finalAmount,
            discount.percent
          );
          finalAmount = newPrice;
          totalDiscountAmount += newDiscountAmount;
        } else if (discount.amount) {
          const { newDiscountAmount, newPrice } = this.checkDiscountAmount(
            finalAmount,
            discount.amount
          );
          finalAmount = newPrice;
          totalDiscountAmount += newDiscountAmount;
        }
      }
    }

    return {
      totalPrice,
      finalAmount,
      totalDiscountAmount,
      productDiscounts,
      products,
      discounts,
    };
  }

  async addToBasket(basketDto: BasketDto, userId?: number, guestId?: string) {
    if (!userId && !guestId) {
      throw new BadRequestException(BadRequestMessage.UserIdOrGuestIdRequired);
    }

    const { colorId, productId, sizeId } = basketDto;
    let size: ProductSize;
    let color: ProductColor;
    let where: FindOptionsWhere<Basket> = {};
    const product = await this.productService.findOneLean(productId);

    if (product.count === 0)
      throw new BadRequestException(ConflictMessage.ProductOutOfStock);

    where["productId"] = product.id;
    if (userId) {
      where["userId"] = userId;
    } else if (guestId) {
      where["guestId"] = guestId;
    }

    if (product.type === ProductType.Coloring && !colorId) {
      throw new BadRequestException(ConflictMessage.ColorRequired);
    } else if (product.type === ProductType.Coloring && colorId) {
      if (isNaN(parseInt(colorId?.toString()))) {
        throw new BadRequestException(ConflictMessage.ColorRequired);
      }
      color = await this.productColorService.findOne(colorId);
      where["colorId"] = colorId;
    } else if (product.type === ProductType.Sizing && !sizeId) {
      throw new BadRequestException(ConflictMessage.SizeRequired);
    } else if (product.type === ProductType.Sizing && sizeId) {
      if (isNaN(parseInt(sizeId?.toString()))) {
        throw new BadRequestException(ConflictMessage.SizeRequired);
      }
      size = await this.productSizeService.findOne(sizeId);
      where["sizeId"] = sizeId;
    }

    let basketItem = await this.basketRepository.findOneBy(where);
    if (basketItem) {
      basketItem.count += 1;
      if (basketItem.count > product.count) {
        throw new BadRequestException(ConflictMessage.ProductOutOfStock);
      }
    } else {
      basketItem = this.basketRepository.create({
        productId,
        sizeId: size?.id,
        colorId: color?.id,
        count: 1,
        userId: userId || null,
        guestId: guestId || null,
      });
    }
    await this.basketRepository.save(basketItem);
    return {
      message: PublicMessage.BasketItemAdded,
    };
  }

  async removeFromBasket(
    basketDto: BasketDto,
    userId?: number,
    guestId?: string
  ) {
    if (!userId && !guestId) {
      throw new BadRequestException(BadRequestMessage.UserIdOrGuestIdRequired);
    }

    const { colorId, productId, sizeId } = basketDto;
    let size: ProductSize;
    let color: ProductColor;
    let where: FindOptionsWhere<Basket> = {};
    const product = await this.productService.findOneLean(productId);
    where["productId"] = product.id;

    if (userId) {
      where["userId"] = userId;
    } else if (guestId) {
      where["guestId"] = guestId;
    }

    if (product.type === ProductType.Coloring && !colorId) {
      throw new BadRequestException(ConflictMessage.ColorRequired);
    } else if (product.type === ProductType.Coloring && colorId) {
      if (isNaN(parseInt(colorId?.toString()))) {
        throw new BadRequestException(ConflictMessage.ColorRequired);
      }
      color = await this.productColorService.findOne(colorId);
      where["colorId"] = colorId;
    } else if (product.type === ProductType.Sizing && !sizeId) {
      throw new BadRequestException(ConflictMessage.SizeRequired);
    } else if (product.type === ProductType.Sizing && sizeId) {
      if (isNaN(parseInt(sizeId?.toString()))) {
        throw new BadRequestException(ConflictMessage.SizeRequired);
      }
      size = await this.productSizeService.findOne(sizeId);
      where["sizeId"] = sizeId;
    }

    let basketItem = await this.basketRepository.findOneBy(where);
    if (basketItem) {
      if (basketItem.count <= 1) {
        await this.basketRepository.delete({ id: basketItem.id });
      } else {
        basketItem.count -= 1;
        await this.basketRepository.save(basketItem);
      }
    } else {
      throw new NotFoundException(NotFoundMessage.BasketItemNotFound);
    }
    return {
      message: PublicMessage.BasketItemRemoved,
    };
  }

  async removeFromBasketById(id: number, userId?: number, guestId?: string) {
    if (!userId && !guestId) {
      throw new BadRequestException(BadRequestMessage.UserIdOrGuestIdRequired);
    }

    const where: FindOptionsWhere<Basket> = { id };
    if (userId) {
      where.userId = userId;
    } else if (guestId) {
      where.guestId = guestId;
    }

    let basketItem = await this.basketRepository.findOneBy(where);
    if (basketItem) {
      if (basketItem.count <= 1) {
        await this.basketRepository.delete({ id: basketItem.id });
      } else {
        basketItem.count -= 1;
        await this.basketRepository.save(basketItem);
      }
    } else {
      throw new NotFoundException(NotFoundMessage.BasketItemNotFound);
    }
    return {
      message: PublicMessage.BasketItemRemoved,
    };
  }

  async updateBasketCount(
    id: number,
    updateDto: { count: number },
    userId?: number,
    guestId?: string
  ) {
    if (!userId && !guestId) {
      throw new BadRequestException(BadRequestMessage.UserIdOrGuestIdRequired);
    }

    const { count } = updateDto;
    const where: FindOptionsWhere<Basket> = { id };
    if (userId) {
      where.userId = userId;
    } else if (guestId) {
      where.guestId = guestId;
    }

    const basketItem = await this.basketRepository.findOneBy(where);

    if (!basketItem) {
      throw new NotFoundException(NotFoundMessage.BasketItemNotFound);
    }

    if (count <= 0) {
      await this.basketRepository.delete({ id: basketItem.id });
      return {
        message: PublicMessage.BasketItemRemoved,
      };
    }

    basketItem.count = count;
    await this.basketRepository.save(basketItem);

    return {
      message: PublicMessage.BasketItemUpdated,
    };
  }

  async clearBasket(userId?: number, guestId?: string) {
    if (!userId && !guestId) {
      throw new BadRequestException(BadRequestMessage.UserIdOrGuestIdRequired);
    }

    const where: FindOptionsWhere<Basket> = {};
    if (userId) {
      where.userId = userId;
    } else if (guestId) {
      where.guestId = guestId;
    }

    await this.basketRepository.delete(where);

    return {
      message: PublicMessage.BasketCleared,
    };
  }

  async addCodeToBasket(
    discountDto: AddDiscountToBasketDto,
    userId?: number,
    guestId?: string
  ) {
    if (!userId && !guestId) {
      throw new BadRequestException(BadRequestMessage.UserIdOrGuestIdRequired);
    }

    const { code } = discountDto;
    const discount = await this.discountService.getDiscountByCode(code);
    if (!discount)
      throw new NotFoundException(NotFoundMessage.DiscountNotFound);

    const where: FindOptionsWhere<Basket> = {};
    if (userId) {
      where.userId = userId;
    } else if (guestId) {
      where.guestId = guestId;
    }

    if (discount.type === DiscountType.Product && discount.productId) {
      where.productId = discount.productId;
      const basketItem = await this.basketRepository.findOneBy(where);
      if (!basketItem)
        throw new BadRequestException(NotFoundMessage.BasketItemNotFound);
    }
    if (
      discount.limit &&
      (discount.limit <= 0 || discount.usage >= discount.limit)
    )
      throw new BadRequestException(ConflictMessage.DiscountLimitReached);
    if (discount.expires_in && discount.expires_in <= new Date())
      throw new BadRequestException(ConflictMessage.DiscountExpired);

    where.discountId = discount.id;
    const existDiscount = await this.basketRepository.findOneBy(where);
    if (existDiscount)
      throw new BadRequestException(ConflictMessage.DiscountAlreadyApplied);

    if (discount.type === DiscountType.Basket) {
      const basketWhere: FindOptionsWhere<Basket> = {};
      if (userId) {
        basketWhere.userId = userId;
      } else if (guestId) {
        basketWhere.guestId = guestId;
      }
      const item = await this.basketRepository.findOne({
        relations: {
          discount: true,
        },
        where: {
          ...basketWhere,
          discount: {
            type: DiscountType.Basket,
          },
        },
      });
      if (item) {
        throw new BadRequestException(ConflictMessage.DiscountAlreadyApplied);
      }
    }

    const insertData: Partial<Basket> = {
      productId: discount?.productId || null,
      discountId: discount.id,
      count: 0,
    };
    if (userId) {
      insertData.userId = userId;
    } else if (guestId) {
      insertData.guestId = guestId;
    }

    await this.basketRepository.insert(insertData);
    return {
      message: PublicMessage.DiscountAdded,
    };
  }

  async removeCodeFromBasket(
    discountDto: AddDiscountToBasketDto,
    userId?: number,
    guestId?: string
  ) {
    if (!userId && !guestId) {
      throw new BadRequestException(BadRequestMessage.UserIdOrGuestIdRequired);
    }

    const { code } = discountDto;
    const discount = await this.discountService.getDiscountByCode(code);
    if (!discount)
      throw new NotFoundException(NotFoundMessage.DiscountNotFound);

    const where: FindOptionsWhere<Basket> = {
      discountId: discount.id,
    };
    if (userId) {
      where.userId = userId;
    } else if (guestId) {
      where.guestId = guestId;
    }

    const existDiscount = await this.basketRepository.findOneBy(where);
    if (existDiscount) {
      await this.basketRepository.delete({ id: existDiscount.id });
    } else {
      throw new NotFoundException(NotFoundMessage.DiscountNotFound);
    }
    return {
      message: PublicMessage.DiscountRemoved,
    };
  }

  async mergeGuestBasket(guestId: string, userId: number): Promise<void> {
    if (!guestId || !userId) {
      return;
    }

    const guestItems = await this.basketRepository.find({
      where: { guestId },
      relations: {
        product: true,
        color: true,
        size: true,
      },
    });

    if (guestItems.length === 0) {
      return;
    }

    for (const guestItem of guestItems) {
      const where: FindOptionsWhere<Basket> = {
        userId,
        productId: guestItem.productId,
      };

      if (guestItem.colorId) {
        where.colorId = guestItem.colorId;
      }
      if (guestItem.sizeId) {
        where.sizeId = guestItem.sizeId;
      }

      const existingUserItem = await this.basketRepository.findOneBy(where);

      if (existingUserItem) {
        const newCount = existingUserItem.count + guestItem.count;
        const product = guestItem.product;
        if (newCount <= product.count) {
          existingUserItem.count = newCount;
          await this.basketRepository.save(existingUserItem);
        } else {
          existingUserItem.count = product.count;
          await this.basketRepository.save(existingUserItem);
        }
        await this.basketRepository.delete({ id: guestItem.id });
      } else {
        guestItem.userId = userId;
        guestItem.guestId = null;
        await this.basketRepository.save(guestItem);
      }
    }
  }

  validateDiscount(discount: Discount) {
    if (!discount.limit && !discount.expires_in) return true;

    let limitCondition = !discount.limit || discount.limit > discount.usage;
    let timeCondition =
      !discount.expires_in || discount.expires_in > new Date();
    return limitCondition && timeCondition;
  }

  checkDiscountPercent(price: number, percent: number) {
    let newDiscountAmount = +price * (+percent / 100);
    let newPrice = +newDiscountAmount > +price ? 0 : +price - newDiscountAmount;
    return {
      newPrice,
      newDiscountAmount,
    };
  }

  checkDiscountAmount(price: number, amount: number) {
    let newPrice = +amount > +price ? 0 : +price - +amount;
    return {
      newPrice,
      newDiscountAmount: +amount,
    };
  }
}
