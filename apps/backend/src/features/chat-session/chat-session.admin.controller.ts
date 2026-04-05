import { Controller, DefaultValuePipe, Get, Inject, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import type { AdminRecentActivityItem, ChatSessionListItem, ChatSessionMessageItem } from "@bon/contracts";
import { AdminSessionGuard } from "../../common/guards/admin-session.guard";
import { ChatSessionService } from "./chat-session.service";

@UseGuards(AdminSessionGuard)
@Controller("admin/chat-sessions")
export class ChatSessionAdminController {
  constructor(@Inject(ChatSessionService) private readonly chatSessionService: ChatSessionService) {}

  @Get("recent-activities")
  listRecentActivities(
    @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number
  ): Promise<AdminRecentActivityItem[]> {
    return this.chatSessionService.listRecentActivities(limit);
  }

  @Get("branches/:branchId")
  listByBranch(@Param("branchId", ParseIntPipe) branchId: number): Promise<ChatSessionListItem[]> {
    return this.chatSessionService.listByBranch(branchId);
  }

  @Get("branches/:branchId/:sessionId/messages")
  listMessages(
    @Param("branchId", ParseIntPipe) branchId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number
  ): Promise<ChatSessionMessageItem[]> {
    return this.chatSessionService.listMessages(branchId, sessionId);
  }
}
