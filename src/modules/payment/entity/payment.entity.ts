import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Order } from "../../order/entity/order.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.Payment)
export class Payment extends BaseEntity {
  @Column()
  amount: number;

  @Column({ default: false })
  status: boolean;

  @Column({ unique: true })
  invoice_number: string;

  @Column({ nullable: true })
  refId: string;

  @Column({ nullable: true })
  authority: string;

  @Column({ nullable: true })
  orderId: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  gateway: string;

  @Column({ nullable: true })
  transaction_id: string;

  @OneToOne(() => Order, (order) => order.payment, { onDelete: "CASCADE" })
  @JoinColumn()
  order: Order;

  @ManyToOne(() => UserEntity, (user) => user.payments, { onDelete: "CASCADE" })
  @JoinColumn()
  user: UserEntity;

  @CreateDateColumn()
  created_at: Date;
}
