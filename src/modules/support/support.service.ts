import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupportTicket } from "./entity/support-ticket.entity";
import { SupportMessage } from "./entity/support-message.entity";
import {
  CreateSupportTicketDto,
  UpdateSupportTicketDto,
  SupportTicketFilterDto,
} from "./dto/support-ticket.dto";
import {
  CreateSupportMessageDto,
  UpdateSupportMessageDto,
  SupportMessageFilterDto,
  MarkAsReadDto,
} from "./dto/support-message.dto";
import {
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketCategory,
  MessageType,
} from "./enum/support.enum";
import {
  PublicMessage,
  NotFoundMessage,
  ConflictMessage,
  BadRequestMessage,
} from "src/common/enums/message.enum";

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private supportTicketRepository: Repository<SupportTicket>,
    @InjectRepository(SupportMessage)
    private supportMessageRepository: Repository<SupportMessage>
  ) {}

  async createTicket(createTicketDto: CreateSupportTicketDto, userId: number) {
    const { title, description, priority, category } = createTicketDto;

    const ticket = this.supportTicketRepository.create({
      title,
      description,
      priority: priority || SupportTicketPriority.Medium,
      category: category || SupportTicketCategory.General,
      status: SupportTicketStatus.Open,
      userId,
    });

    const savedTicket = await this.supportTicketRepository.save(ticket);

    return {
      message: PublicMessage.SupportTicketCreated,
      ticket: savedTicket,
    };
  }

  async getAllTickets(filterDto: SupportTicketFilterDto) {
    const { status, priority, category, page = 1, limit = 10 } = filterDto;

    try {
      const queryBuilder =
        this.supportTicketRepository.createQueryBuilder("ticket");

      if (status) {
        queryBuilder.andWhere("ticket.status = :status", { status });
      }

      if (priority) {
        queryBuilder.andWhere("ticket.priority = :priority", { priority });
      }

      if (category) {
        queryBuilder.andWhere("ticket.category = :category", { category });
      }

      queryBuilder
        .leftJoin("ticket.user", "user")
        .leftJoin("ticket.assignedTo", "assignedTo")
        .leftJoin("ticket.messages", "messages")
        .addSelect([
          "user.id",
          "user.username",
          "user.phone",
          "user.email",
          "user.role",
        ])
        .addSelect([
          "assignedTo.id",
          "assignedTo.username",
          "assignedTo.phone",
          "assignedTo.email",
          "assignedTo.role",
        ])
        .addSelect([
          "messages.id",
          "messages.content",
          "messages.type",
          "messages.attachmentUrl",
          "messages.attachmentName",
          "messages.attachmentSize",
          "messages.isRead",
          "messages.readAt",
          "messages.created_at",
        ])
        .orderBy("ticket.created_at", "DESC")
        .skip((page - 1) * limit)
        .take(limit);

      const [tickets, total] = await queryBuilder.getManyAndCount();

      return {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        tickets,
      };
    } catch (error) {
      console.error("Error in getAllTickets:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
  }

  async getUserTickets(userId: number, filterDto: SupportTicketFilterDto) {
    const { status, priority, category, page = 1, limit = 10 } = filterDto;

    try {
      const queryBuilder =
        this.supportTicketRepository.createQueryBuilder("ticket");
      queryBuilder.where("ticket.userId = :userId", { userId });

      if (status) {
        queryBuilder.andWhere("ticket.status = :status", { status });
      }

      if (priority) {
        queryBuilder.andWhere("ticket.priority = :priority", { priority });
      }

      if (category) {
        queryBuilder.andWhere("ticket.category = :category", { category });
      }

      queryBuilder
        .leftJoin("ticket.user", "user")
        .leftJoin("ticket.assignedTo", "assignedTo")
        .leftJoin("ticket.messages", "messages")
        .addSelect([
          "user.id",
          "user.username",
          "user.phone",
          "user.email",
          "user.role",
        ])
        .addSelect([
          "assignedTo.id",
          "assignedTo.username",
          "assignedTo.phone",
          "assignedTo.email",
          "assignedTo.role",
        ])
        .addSelect([
          "messages.id",
          "messages.content",
          "messages.type",
          "messages.attachmentUrl",
          "messages.attachmentName",
          "messages.attachmentSize",
          "messages.isRead",
          "messages.readAt",
          "messages.created_at",
        ])
        .orderBy("ticket.created_at", "DESC")
        .skip((page - 1) * limit)
        .take(limit);

      const [tickets, total] = await queryBuilder.getManyAndCount();

      return {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        tickets,
      };
    } catch (error) {
      console.error("Error in getUserTickets:", error);
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
  }

  async getTicketById(ticketId: number, userId?: number) {
    try {
      const queryBuilder =
        this.supportTicketRepository.createQueryBuilder("ticket");
      queryBuilder.where("ticket.id = :ticketId", { ticketId });

      if (userId) {
        queryBuilder.andWhere(
          "(ticket.userId = :userId OR ticket.assignedToId = :userId)",
          { userId }
        );
      }

      const ticket = await queryBuilder
        .leftJoin("ticket.user", "user")
        .leftJoin("ticket.assignedTo", "assignedTo")
        .leftJoin("ticket.messages", "messages")
        .leftJoin("messages.sender", "sender")
        .addSelect([
          "user.id",
          "user.username",
          "user.phone",
          "user.email",
          "user.role",
        ])
        .addSelect([
          "assignedTo.id",
          "assignedTo.username",
          "assignedTo.phone",
          "assignedTo.email",
          "assignedTo.role",
        ])
        .addSelect([
          "messages.id",
          "messages.content",
          "messages.type",
          "messages.attachmentUrl",
          "messages.attachmentName",
          "messages.attachmentSize",
          "messages.isRead",
          "messages.readAt",
          "messages.created_at",
        ])
        .addSelect([
          "sender.id",
          "sender.username",
          "sender.phone",
          "sender.email",
          "sender.role",
        ])
        .orderBy("messages.created_at", "ASC")
        .getOne();

      if (!ticket) {
        throw new NotFoundException(NotFoundMessage.SupportTicketNotFound);
      }

      return {
        message: PublicMessage.SupportTicketRetrieved,
        ticket,
      };
    } catch (error) {
      console.error("Error in getTicketById:", error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
  }

  async updateTicket(
    ticketId: number,
    updateTicketDto: UpdateSupportTicketDto,
    userId: number,
    isAdmin: boolean = false
  ) {
    const ticket = await this.supportTicketRepository.findOne({
      where: { id: ticketId },
      relations: { user: true, assignedTo: true },
    });

    if (!ticket) {
      throw new NotFoundException(NotFoundMessage.SupportTicketNotFound);
    }

    if (!isAdmin && ticket.userId !== userId) {
      throw new ForbiddenException(
        ConflictMessage.SupportTicketCannotBeModified
      );
    }

    if (ticket.status === SupportTicketStatus.Closed) {
      throw new BadRequestException(ConflictMessage.SupportTicketAlreadyClosed);
    }

    const {
      title,
      description,
      status,
      priority,
      category,
      assignedToId,
      resolution,
    } = updateTicketDto;

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (category) ticket.category = category;
    if (assignedToId) ticket.assignedToId = assignedToId;
    if (resolution) ticket.resolution = resolution;

    if (status === SupportTicketStatus.Resolved) {
      ticket.resolvedAt = new Date();
    } else if (status === SupportTicketStatus.Closed) {
      ticket.closedAt = new Date();
    }

    const updatedTicket = await this.supportTicketRepository.save(ticket);

    return {
      message: PublicMessage.SupportTicketUpdated,
      ticket: updatedTicket,
    };
  }

  async closeTicket(
    ticketId: number,
    userId: number,
    isAdmin: boolean = false
  ) {
    const ticket = await this.supportTicketRepository.findOneBy({
      id: ticketId,
    });

    if (!ticket) {
      throw new NotFoundException(NotFoundMessage.SupportTicketNotFound);
    }

    if (!isAdmin && ticket.userId !== userId) {
      throw new ForbiddenException(
        ConflictMessage.SupportTicketCannotBeModified
      );
    }

    if (ticket.status === SupportTicketStatus.Closed) {
      throw new BadRequestException(ConflictMessage.SupportTicketAlreadyClosed);
    }

    ticket.status = SupportTicketStatus.Closed;
    ticket.closedAt = new Date();

    const closedTicket = await this.supportTicketRepository.save(ticket);

    return {
      message: PublicMessage.SupportTicketClosed,
      ticket: closedTicket,
    };
  }

  async sendMessage(createMessageDto: CreateSupportMessageDto, userId: number) {
    const {
      content,
      ticketId,
      type,
      attachmentUrl,
      attachmentName,
      attachmentSize,
    } = createMessageDto;

    const ticket = await this.supportTicketRepository.findOne({
      where: { id: ticketId },
      relations: { user: true, assignedTo: true },
    });

    if (!ticket) {
      throw new NotFoundException(NotFoundMessage.SupportTicketNotFound);
    }

    if (ticket.userId !== userId && ticket.assignedToId !== userId) {
      throw new ForbiddenException(
        ConflictMessage.SupportTicketCannotBeModified
      );
    }

    if (ticket.status === SupportTicketStatus.Closed) {
      throw new BadRequestException(ConflictMessage.SupportTicketAlreadyClosed);
    }

    const message = this.supportMessageRepository.create({
      content,
      ticketId,
      type: type || MessageType.Text,
      attachmentUrl,
      attachmentName,
      attachmentSize,
      senderId: userId,
    });

    const savedMessage = await this.supportMessageRepository.save(message);

    if (
      ticket.userId === userId &&
      ticket.status === SupportTicketStatus.Open
    ) {
      ticket.status = SupportTicketStatus.InProgress;
      await this.supportTicketRepository.save(ticket);
    }

    return {
      message: PublicMessage.SupportMessageSent,
      messageData: savedMessage,
    };
  }

  async getTicketMessages(
    ticketId: number,
    filterDto: SupportMessageFilterDto,
    userId: number
  ) {
    const { type, isRead, page = 1, limit = 10 } = filterDto;

    const ticket = await this.supportTicketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(NotFoundMessage.SupportTicketNotFound);
    }

    if (ticket.userId !== userId && ticket.assignedToId !== userId) {
      throw new ForbiddenException(
        ConflictMessage.SupportTicketCannotBeModified
      );
    }

    const queryBuilder =
      this.supportMessageRepository.createQueryBuilder("message");
    queryBuilder.where("message.ticketId = :ticketId", { ticketId });

    if (type) {
      queryBuilder.andWhere("message.type = :type", { type });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere("message.isRead = :isRead", { isRead });
    }

    queryBuilder
      .leftJoin("message.sender", "sender")
      .addSelect([
        "sender.id",
        "sender.username",
        "sender.phone",
        "sender.email",
        "sender.role",
      ])
      .orderBy("message.created_at", "ASC")
      .skip((page - 1) * limit)
      .take(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    return {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      messages,
    };
  }

  async markMessageAsRead(markAsReadDto: MarkAsReadDto, userId: number) {
    const { messageId } = markAsReadDto;

    const message = await this.supportMessageRepository.findOne({
      where: { id: messageId },
      relations: { ticket: true },
    });

    if (!message) {
      throw new NotFoundException(NotFoundMessage.SupportMessageNotFound);
    }

    if (
      message.ticket.userId !== userId &&
      message.ticket.assignedToId !== userId
    ) {
      throw new ForbiddenException(
        ConflictMessage.SupportTicketCannotBeModified
      );
    }

    message.isRead = true;
    message.readAt = new Date();

    const updatedMessage = await this.supportMessageRepository.save(message);

    return {
      message: "پیام با موفقیت به عنوان خوانده شده علامت‌گذاری شد",
      messageData: updatedMessage,
    };
  }

  async getSupportStats(userId?: number) {
    const queryBuilder =
      this.supportTicketRepository.createQueryBuilder("ticket");

    if (userId) {
      queryBuilder.where("ticket.userId = :userId", { userId });
    }

    const totalTickets = await queryBuilder.getCount();
    const openTickets = await queryBuilder
      .andWhere("ticket.status = :status", { status: SupportTicketStatus.Open })
      .getCount();
    const inProgressTickets = await queryBuilder
      .andWhere("ticket.status = :status", {
        status: SupportTicketStatus.InProgress,
      })
      .getCount();
    const resolvedTickets = await queryBuilder
      .andWhere("ticket.status = :status", {
        status: SupportTicketStatus.Resolved,
      })
      .getCount();
    const closedTickets = await queryBuilder
      .andWhere("ticket.status = :status", {
        status: SupportTicketStatus.Closed,
      })
      .getCount();

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      responseRate:
        totalTickets > 0
          ? ((resolvedTickets + closedTickets) / totalTickets) * 100
          : 0,
    };
  }
}
