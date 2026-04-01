import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import type {
  CreateChatMessageRequest,
  CreateChatSessionRequest,
  ChatSessionListItem,
  ChatSessionMessageItem
} from "@bon/contracts";
import {
  CreateChatMessageRequestSchema,
  CreateChatSessionRequestSchema
} from "@bon/contracts";
import type { SessionUser } from "@bon/entities";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { BranchSessionGuard } from "../../common/guards/branch-session.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { ChatSessionService } from "./chat-session.service";

const createChatSessionBodyPipe = new ZodValidationPipe(CreateChatSessionRequestSchema);
const createChatMessageBodyPipe = new ZodValidationPipe(CreateChatMessageRequestSchema);

@UseGuards(BranchSessionGuard)
@Controller("chat-sessions")
export class ChatSessionController {
  constructor(@Inject(ChatSessionService) private readonly chatSessionService: ChatSessionService) {}

  @Get()
  list(@CurrentUser() user: SessionUser): Promise<ChatSessionListItem[]> {
    return this.chatSessionService.listByBranch(user.branchId!);
  }

  @Post()
  create(
    @CurrentUser() user: SessionUser,
    @Body(createChatSessionBodyPipe) body: CreateChatSessionRequest
  ): Promise<ChatSessionListItem> {
    return this.chatSessionService.create(user.branchId!, body);
  }

  @Get(":id/messages")
  listMessages(
    @CurrentUser() user: SessionUser,
    @Param("id", ParseIntPipe) id: number
  ): Promise<ChatSessionMessageItem[]> {
    return this.chatSessionService.listMessages(user.branchId!, id);
  }

  @Post(":id/messages")
  createMessage(
    @CurrentUser() user: SessionUser,
    @Param("id", ParseIntPipe) id: number,
    @Body(createChatMessageBodyPipe) body: CreateChatMessageRequest
  ): Promise<ChatSessionMessageItem> {
    return this.chatSessionService.createMessage(user.branchId!, id, body);
  }
}
