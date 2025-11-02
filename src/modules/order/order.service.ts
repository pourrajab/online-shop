import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entity/order.entity";
import { OrderItems } from "./entity/order-items.entity";
import { OrderStatus } from "./enum/order.enum";
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderFilterDto,
} from "./dto/order.dto";
import {
  PublicMessage,
  NotFoundMessage,
  ConflictMessage,
  BadRequestMessage,
} from "src/common/enums/message.enum";
import { AddressEntity } from "../user/entities/address.entity";
import { BasketData, BasketProduct } from "./types/basket-data.type";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItems)
    private orderItemsRepository: Repository<OrderItems>,
    @InjectRepository(AddressEntity)
    private addressRepository: Repository<AddressEntity>
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    userId: number,
    basketData: BasketData
  ) {
    const { addressId } = createOrderDto;

    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException(NotFoundMessage.AddressNotFound);
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const addressString = `${address.province}، ${address.city}، ${address.address_details}، پلاک ${address.plaque}، کد پستی ${address.postal_code}`;

    const queryRunner =
      this.orderRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = queryRunner.manager.create(Order, {
        orderNumber,
        address: addressString,
        userId,
        final_amount: basketData.finalAmount,
        total_amount: basketData.totalPrice,
        discount_amount: basketData.totalDiscountAmount,
        status: OrderStatus.Pending,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      const orderItems = basketData.products.map((product: BasketProduct) =>
        queryRunner.manager.create(OrderItems, {
          orderId: savedOrder.id,
          productId: product.id,
          colorId: product.colorId || null,
          sizeId: product.sizeId || null,
          quantity: product.count || 1,
          price: product.price,
        })
      );

      await queryRunner.manager.save(OrderItems, orderItems);

      await queryRunner.commitTransaction();
      return {
        message: PublicMessage.OrderCreated,
        order: savedOrder,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("OrderService.createOrder tx error:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    } finally {
      await queryRunner.release();
    }
  }

  async getUserOrders(userId: number, filterDto: OrderFilterDto) {
    const { status, page = 1, limit = 10 } = filterDto;

    const queryBuilder = this.orderRepository.createQueryBuilder("order");
    queryBuilder.where("order.userId = :userId", { userId });

    if (status) {
      queryBuilder.andWhere("order.status = :status", { status });
    }

    queryBuilder
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product")
      .leftJoinAndSelect("items.color", "color")
      .leftJoinAndSelect("items.size", "size")
      .orderBy("order.created_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    try {
      const [orders, total] = await queryBuilder.getManyAndCount();

      return {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        orders,
      };
    } catch (error) {
      console.error("Error in getUserOrders:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
  }

  async getOrderById(orderId: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: {
        items: {
          product: true,
          color: true,
          size: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException(NotFoundMessage.OrderNotFound);
    }

    return {
      message: PublicMessage.OrderRetrieved,
      order,
    };
  }

  async getAllOrders(filterDto: OrderFilterDto) {
    const { status, page = 1, limit = 10 } = filterDto;

    const queryBuilder = this.orderRepository.createQueryBuilder("order");

    if (status) {
      queryBuilder.where("order.status = :status", { status });
    }

    queryBuilder
      .leftJoinAndSelect("order.items", "items")
      .leftJoin("order.user", "user")
      .leftJoinAndSelect("items.product", "product")
      .leftJoinAndSelect("items.color", "color")
      .leftJoinAndSelect("items.size", "size")
      .addSelect([
        "user.id",
        "user.username",
        "user.phone",
        "user.email",
        "user.role",
      ])
      .orderBy("order.created_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    try {
      const [orders, total] = await queryBuilder.getManyAndCount();

      return {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        orders,
      };
    } catch (error) {
      console.error("Error in getAllOrders:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
  }

  async updateOrderStatus(
    orderId: number,
    updateDto: UpdateOrderStatusDto,
    userId?: number
  ) {
    const whereCondition: { id: number; userId?: number } = { id: orderId };
    if (userId) {
      whereCondition.userId = userId;
    }

    const order = await this.orderRepository.findOneBy(whereCondition);
    if (!order) {
      throw new NotFoundException(NotFoundMessage.OrderNotFound);
    }

    order.status = updateDto.status;
    await this.orderRepository.save(order);

    return {
      message: PublicMessage.OrderStatusUpdated,
      order,
    };
  }

  async getAllOrdered() {
    return this.orderRepository.find({
      where: {
        status: OrderStatus.Ordered,
      },
    });
  }

  async findById(orderId: number) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException(NotFoundMessage.OrderNotFound);
    return order;
  }

  async setInProcess(orderId: number) {
    const order = await this.findById(orderId);
    if (order.status !== OrderStatus.Ordered)
      throw new BadRequestException(ConflictMessage.OrderNotInPaidQueue);
    order.status = OrderStatus.InProcess;
    await this.orderRepository.save(order);
    return {
      message: PublicMessage.OrderStatusUpdated,
    };
  }

  async setPacked(orderId: number) {
    const order = await this.findById(orderId);
    if (order.status !== OrderStatus.InProcess)
      throw new BadRequestException(ConflictMessage.OrderNotInProcess);
    order.status = OrderStatus.Packed;
    await this.orderRepository.save(order);
    return {
      message: PublicMessage.OrderStatusUpdated,
    };
  }

  async setToTransit(orderId: number) {
    const order = await this.findById(orderId);
    if (order.status !== OrderStatus.Packed)
      throw new BadRequestException(ConflictMessage.OrderNotPacked);
    order.status = OrderStatus.InTransit;
    await this.orderRepository.save(order);
    return {
      message: PublicMessage.OrderStatusUpdated,
    };
  }

  async delivery(orderId: number) {
    const order = await this.findById(orderId);
    if (order.status !== OrderStatus.InTransit)
      throw new BadRequestException(ConflictMessage.OrderNotInTransit);
    order.status = OrderStatus.Delivered;
    await this.orderRepository.save(order);
    return {
      message: PublicMessage.OrderStatusUpdated,
    };
  }

  async canceled(orderId: number) {
    const order = await this.findById(orderId);
    if (
      order.status === OrderStatus.Delivered ||
      order.status === OrderStatus.Canceled
    )
      throw new BadRequestException(ConflictMessage.OrderCannotBeCanceled);
    order.status = OrderStatus.Canceled;
    await this.orderRepository.save(order);
    return {
      message: PublicMessage.OrderCanceled,
    };
  }
}
