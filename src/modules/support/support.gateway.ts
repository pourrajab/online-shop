import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { SupportService } from "./support.service";
import { CreateSupportMessageDto } from "./dto/support-message.dto";
import { SupportTicketStatus } from "./enum/support.enum";
import { AuthService } from "../auth/auth.service";
import { UserEntity } from "../user/entities/user.entity";
import { UserStatus } from "../user/enum/status.enum";
import { AuthMessage } from "src/common/enums/message.enum";
import { parseCookies } from "src/common/utils/cookie.util";
import { isJWT } from "class-validator";

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  namespace: "/support",
})
export class SupportGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<number, string> = new Map();

  constructor(
    private readonly supportService: SupportService,
    private readonly authService: AuthService
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      let token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        const cookieHeader = client.handshake.headers.cookie || "";
        const cookies = parseCookies(cookieHeader);
        token = cookies[CookieKeys.AccessToken];
      }

      if (!token || !isJWT(token)) {
        client.disconnect();
        return;
      }

      let user: UserEntity | null = null;
      try {
        user = await this.authService.validateAccessToken(token);
      } catch (err) {
        try {
          user = await this.authService.validateUsernameToken(token);
        } catch {
          client.disconnect();
          return;
        }
      }

      if (!user) {
        client.disconnect();
        return;
      }

      if (user.status === UserStatus.Blocked) {
        client.emit("error", {
          message: AuthMessage.Blocked,
        });
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.userRole = user.role;

      this.connectedUsers.set(client.userId, client.id);

      await client.join(`user_${client.userId}`);

      const role = String(client.userRole || "").toLowerCase();
      if (role === "admin" || role === "superadmin") {
        await client.join("admin_room");
      }

      console.log(`User ${client.userId} connected to support gateway`);

      client.emit("connected", {
        message: "Connected to support gateway",
        userId: client.userId,
      });
    } catch (error) {
      console.error("Connection error:", error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`User ${client.userId} disconnected from support gateway`);
    }
  }

  @SubscribeMessage("join_ticket")
  async handleJoinTicket(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: number }
  ) {
    try {
      const { ticketId } = data;

      const ticket = await this.supportService.getTicketById(
        ticketId,
        client.userId
      );

      if (ticket) {
        await client.join(`ticket_${ticketId}`);
        client.emit("joined_ticket", {
          message: `Joined ticket ${ticketId}`,
          ticketId,
        });
      } else {
        client.emit("error", {
          message: "Access denied to this ticket",
        });
      }
    } catch (error) {
      client.emit("error", {
        message: "Failed to join ticket",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("leave_ticket")
  async handleLeaveTicket(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: number }
  ) {
    const { ticketId } = data;
    await client.leave(`ticket_${ticketId}`);
    client.emit("left_ticket", {
      message: `Left ticket ${ticketId}`,
      ticketId,
    });
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: CreateSupportMessageDto
  ) {
    try {
      const result = await this.supportService.sendMessage(data, client.userId);

      this.server.to(`ticket_${data.ticketId}`).emit("new_message", {
        ticketId: data.ticketId,
        message: result.messageData,
        senderId: client.userId,
      });

      this.server.to("admin_room").emit("ticket_updated", {
        ticketId: data.ticketId,
        message: "New message received",
      });

      client.emit("message_sent", {
        message: "Message sent successfully",
        messageId: result.messageData?.id,
      });
    } catch (error) {
      client.emit("error", {
        message: "Failed to send message",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("mark_as_read")
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: number }
  ) {
    try {
      const result = await this.supportService.markMessageAsRead(
        { messageId: data.messageId },
        client.userId
      );

      this.server
        .to(`ticket_${result.messageData.ticketId}`)
        .emit("message_read", {
          messageId: data.messageId,
          readBy: client.userId,
          readAt: result.messageData.readAt,
        });

      client.emit("marked_as_read", {
        message: "Message marked as read",
        messageId: data.messageId,
      });
    } catch (error) {
      client.emit("error", {
        message: "Failed to mark message as read",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("typing")
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: number; isTyping: boolean }
  ) {
    const { ticketId, isTyping } = data;

    client.to(`ticket_${ticketId}`).emit("user_typing", {
      userId: client.userId,
      ticketId,
      isTyping,
    });
  }

  @SubscribeMessage("assign_ticket")
  async handleAssignTicket(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: number; assignToId: number }
  ) {
    {
      const role = String(client.userRole || "").toLowerCase();
      if (!(role === "admin" || role === "superadmin")) {
        client.emit("error", {
          message: "Access denied. Admin role required.",
        });
        return;
      }
    }

    try {
      const result = await this.supportService.updateTicket(
        data.ticketId,
        { assignedToId: data.assignToId },
        client.userId,
        true
      );

      this.server.to(`user_${data.assignToId}`).emit("ticket_assigned", {
        ticketId: data.ticketId,
        assignedBy: client.userId,
        message: "You have been assigned a new ticket",
      });

      this.server.to(`ticket_${data.ticketId}`).emit("ticket_updated", {
        ticketId: data.ticketId,
        message: "Ticket assigned",
        assignedTo: data.assignToId,
      });

      client.emit("ticket_assigned", {
        message: "Ticket assigned successfully",
        ticketId: data.ticketId,
      });
    } catch (error) {
      client.emit("error", {
        message: "Failed to assign ticket",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("update_ticket_status")
  async handleUpdateTicketStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: number; status: string }
  ) {
    {
      const role = String(client.userRole || "").toLowerCase();
      if (!(role === "admin" || role === "superadmin")) {
        client.emit("error", {
          message: "Access denied. Admin role required.",
        });
        return;
      }
    }

    try {
      const result = await this.supportService.updateTicket(
        data.ticketId,
        { status: data.status as SupportTicketStatus },
        client.userId,
        true
      );

      this.server.to(`ticket_${data.ticketId}`).emit("ticket_status_updated", {
        ticketId: data.ticketId,
        status: data.status,
        updatedBy: client.userId,
      });

      client.emit("status_updated", {
        message: "Ticket status updated successfully",
        ticketId: data.ticketId,
        status: data.status,
      });
    } catch (error) {
      client.emit("error", {
        message: "Failed to update ticket status",
        error: error.message,
      });
    }
  }

  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }
}
