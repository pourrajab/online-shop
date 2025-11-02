import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { SupportMessage } from "./support-message.entity";
import {
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketCategory,
} from "../enum/support.enum";

@Entity({ name: EntityName.SupportTicket })
export class SupportTicket extends BaseEntity {
  @Column()
  title: string;

  @Column("text")
  description: string;

  @Column({
    type: "enum",
    enum: SupportTicketStatus,
    default: SupportTicketStatus.Open,
  })
  status: SupportTicketStatus;

  @Column({
    type: "enum",
    enum: SupportTicketPriority,
    default: SupportTicketPriority.Medium,
  })
  priority: SupportTicketPriority;

  @Column({
    type: "enum",
    enum: SupportTicketCategory,
    default: SupportTicketCategory.General,
  })
  category: SupportTicketCategory;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  assignedToId: number;

  @Column({ nullable: true })
  resolution: string;

  @Column({ type: "timestamp", nullable: true })
  resolvedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  closedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.supportTickets, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.assignedTickets, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn()
  assignedTo: UserEntity;

  @OneToMany(() => SupportMessage, (message) => message.ticket, {
    cascade: true,
  })
  messages: SupportMessage[];

  @CreateDateColumn()
  created_at: Date;
}
