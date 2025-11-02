import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { SupportTicket } from "./support-ticket.entity";
import { MessageType } from "../enum/support.enum";

@Entity({ name: EntityName.SupportMessage })
export class SupportMessage extends BaseEntity {
  @Column("text")
  content: string;

  @Column({
    type: "enum",
    enum: MessageType,
    default: MessageType.Text,
  })
  type: MessageType;

  @Column({ nullable: true })
  attachmentUrl: string;

  @Column({ nullable: true })
  attachmentName: string;

  @Column({ nullable: true })
  attachmentSize: number;

  @Column({ nullable: true })
  ticketId: number;

  @Column({ nullable: true })
  senderId: number;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: "timestamp", nullable: true })
  readAt: Date;

  @ManyToOne(() => SupportTicket, (ticket) => ticket.messages, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  ticket: SupportTicket;

  @ManyToOne(() => UserEntity, (user) => user.supportMessages, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn()
  sender: UserEntity;

  @CreateDateColumn()
  created_at: Date;
}
