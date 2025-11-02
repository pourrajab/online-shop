import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { OrderStatus } from "../enum/order.enum";
import { OrderItems } from "./order-items.entity";
import { Payment } from "../../payment/entity/payment.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.Order)
export class Order extends BaseEntity {
  @Column({ unique: true })
  orderNumber: string;

  @Column()
  address: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  final_amount: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.Pending })
  status: OrderStatus;

  @Column({ nullable: true })
  paymentId: number;

  @Column({ nullable: true })
  userId: number;

  @OneToMany(() => OrderItems, (item) => item.order, { onDelete: "CASCADE" })
  items: OrderItems[];

  @OneToOne(() => Payment, (payment) => payment.order, { onDelete: "SET NULL" })
  @JoinColumn()
  payment: Payment;
  @ManyToOne(() => UserEntity, (user) => user.orders, { onDelete: "CASCADE" })
  @JoinColumn()
  user: UserEntity;

  @CreateDateColumn()
  created_at: Date;
}
