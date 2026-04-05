import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  AdminRecentActivityItem,
  ChatSessionListItem,
  ChatSessionMessageItem,
  CreateChatMessageRequest,
  CreateChatSessionRequest
} from "@bon/contracts";
import {
  toAdminRecentActivityItem,
  toChatSessionListItem,
  toChatSessionMessageItem
} from "./chat-session.mapper";
import { ChatSessionRepository } from "./chat-session.repository";

@Injectable()
export class ChatSessionService {
  constructor(@Inject(ChatSessionRepository) private readonly chatSessionRepository: ChatSessionRepository) {}

  async listByBranch(branchId: number): Promise<ChatSessionListItem[]> {
    const rows = await this.chatSessionRepository.listByBranch(branchId);
    return rows.map(toChatSessionListItem);
  }

  async listRecentActivities(limit: number): Promise<AdminRecentActivityItem[]> {
    const safeLimit = Math.max(1, Math.min(limit, 5));
    const rows = await this.chatSessionRepository.listRecentActivities(safeLimit);
    return rows.map(toAdminRecentActivityItem);
  }

  async create(branchId: number, input: CreateChatSessionRequest): Promise<ChatSessionListItem> {
    const row = await this.chatSessionRepository.create(branchId, input.title);
    return toChatSessionListItem(row);
  }

  async listMessages(branchId: number, sessionId: number): Promise<ChatSessionMessageItem[]> {
    await this.assertSessionOwner(branchId, sessionId);
    const rows = await this.chatSessionRepository.listMessages(sessionId);
    return rows.map(toChatSessionMessageItem);
  }

  async createMessage(
    branchId: number,
    sessionId: number,
    input: CreateChatMessageRequest
  ): Promise<ChatSessionMessageItem> {
    await this.assertSessionOwner(branchId, sessionId);

    const row = await this.chatSessionRepository.createMessage({
      sessionId,
      role: input.role,
      content: input.content,
      references: input.references?.map((reference) => ({
        articleId: reference.article_id,
        categoryCode: reference.category_code,
        title: reference.title
      })),
      fallbackToSm: input.fallback_to_sm ?? null
    });

    await this.chatSessionRepository.touchSession(sessionId, row.createdAt);

    return toChatSessionMessageItem(row);
  }

  private async assertSessionOwner(branchId: number, sessionId: number) {
    const session = await this.chatSessionRepository.findOwnedSession(branchId, sessionId);

    if (!session) {
      throw new NotFoundException("대화 세션을 찾을 수 없습니다.");
    }

    return session;
  }
}
