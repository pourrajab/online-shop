import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import shortid from "shortid";
import { Repository } from "typeorm";
import { BasketService } from "../basket/basket.service";
import { ZarinpalService } from "../http/zarinpal.service";
import { Order } from "../order/entity/order.entity";
import { OrderStatus } from "../order/enum/order.enum";
import { OrderService } from "../order/order.service";
import { Payment } from "./entity/payment.entity";
import {
  CreatePaymentDto,
  PaymentFilterDto,
  PaymentVerifyDto,
} from "./dto/payment.dto";
import {
  PublicMessage,
  NotFoundMessage,
  ConflictMessage,
  BadRequestMessage,
} from "src/common/enums/message.enum";

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private basketService: BasketService,
    private orderService: OrderService,
    private zarinpalService: ZarinpalService
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: number) {
    const { orderId, description } = createPaymentDto;

    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: { user: true },
    });

    if (!order) {
      throw new NotFoundException(NotFoundMessage.OrderNotFound);
    }

    if (order.paymentId) {
      throw new BadRequestException(
        "پرداخت برای این سفارش قبلاً ایجاد شده است"
      );
    }

    const user = {
      email: order.user.email || "user@example.com",
      mobile: order.user.phone || "09123456789",
    };

    const { authority, gatewayURL } = await this.zarinpalService.sendRequest({
      amount: order.final_amount,
      description: description || "پرداخت سفارش",
      user,
    });

    const payment = this.paymentRepository.create({
      amount: order.final_amount,
      authority,
      orderId: order.id,
      userId,
      invoice_number: shortid.generate(),
      description: description || "پرداخت سفارش",
      gateway: "zarinpal",
      status: false,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    order.paymentId = savedPayment.id;
    await this.orderRepository.save(order);

    return {
      message: PublicMessage.PaymentCreated,
      payment: savedPayment,
      gatewayURL,
    };
  }

  async verify(verifyDto: PaymentVerifyDto) {
    const { authority, status } = verifyDto;

    const payment = await this.paymentRepository.findOne({
      where: { authority },
      relations: { order: true, user: true },
    });

    if (!payment) {
      throw new NotFoundException(NotFoundMessage.PaymentNotFound);
    }

    if (payment.status) {
      throw new BadRequestException(ConflictMessage.PaymentAlreadyVerified);
    }

    if (status === "OK") {
      const order = await this.orderRepository.findOneBy({
        id: payment.orderId,
      });

      if (!order) {
        throw new NotFoundException(NotFoundMessage.OrderNotFound);
      }

      order.status = OrderStatus.Ordered;

      payment.status = true;
      payment.transaction_id = authority;

      await Promise.all([
        this.paymentRepository.save(payment),
        this.orderRepository.save(order),
      ]);

      return {
        message: PublicMessage.PaymentVerified,
        success: true,
        orderId: order.id,
        paymentId: payment.id,
        redirectUrl: `https://frontendurl.com/payment/success?order_no=${order.id}`,
      };
    } else {
      return {
        message: PublicMessage.PaymentFailed,
        success: false,
        redirectUrl: "https://frontendurl.com/payment/failure",
      };
    }
  }

  async getUserPayments(userId: number, filterDto: PaymentFilterDto) {
    const { status, page = 1, limit = 10 } = filterDto;

    try {
      const queryBuilder = this.paymentRepository.createQueryBuilder("payment");
      queryBuilder.where("payment.userId = :userId", { userId });

      if (status !== undefined) {
        queryBuilder.andWhere("payment.status = :status", { status });
      }

      queryBuilder
        .leftJoinAndSelect("payment.order", "order")
        .leftJoinAndSelect("order.items", "items")
        .leftJoinAndSelect("items.product", "product")
        .orderBy("payment.created_at", "DESC")
        .skip((page - 1) * limit)
        .take(limit);

      const [payments, total] = await queryBuilder.getManyAndCount();

      return {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        payments,
      };
    } catch (error) {
      console.error("Error in getUserPayments:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
  }

  async getAllPayments(filterDto: PaymentFilterDto) {
    const { status, page = 1, limit = 10 } = filterDto;

    try {
      const queryBuilder = this.paymentRepository.createQueryBuilder("payment");

      if (status !== undefined) {
        queryBuilder.where("payment.status = :status", { status });
      }

      queryBuilder
        .leftJoinAndSelect("payment.order", "order")
        .leftJoinAndSelect("payment.user", "user")
        .leftJoinAndSelect("order.items", "items")
        .leftJoinAndSelect("items.product", "product")
        .orderBy("payment.created_at", "DESC")
        .skip((page - 1) * limit)
        .take(limit);

      const [payments, total] = await queryBuilder.getManyAndCount();

      return {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        payments,
      };
    } catch (error) {
      console.error("Error in getAllPayments:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
  }

  async getPaymentById(paymentId: number, userId: number) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, userId },
      relations: {
        order: {
          items: {
            product: true,
            color: true,
            size: true,
          },
        },
        user: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(NotFoundMessage.PaymentNotFound);
    }

    return {
      message: PublicMessage.PaymentRetrieved,
      payment,
    };
  }

  async getPaymentStats(userId?: number) {
    const queryBuilder = this.paymentRepository.createQueryBuilder("payment");

    if (userId) {
      queryBuilder.where("payment.userId = :userId", { userId });
    }

    const totalPayments = await queryBuilder.getCount();
    const successfulPayments = await queryBuilder
      .andWhere("payment.status = :status", { status: true })
      .getCount();
    const totalAmount = await queryBuilder
      .select("SUM(payment.amount)", "total")
      .andWhere("payment.status = :status", { status: true })
      .getRawOne();

    return {
      totalPayments,
      successfulPayments,
      failedPayments: totalPayments - successfulPayments,
      totalAmount: totalAmount?.total || 0,
      successRate:
        totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
    };
  }

  async find() {
    return this.paymentRepository.find({
      order: {
        id: "DESC",
      },
    });
  }
}
