import type {
  AdminRecentActivityItem,
  ChatSessionListItem,
  ChatSessionMessageItem
} from "@bon/contracts";
import { chatMessages, chatSessions } from "@bon/db";

export function toChatSessionListItem(row: typeof chatSessions.$inferSelect): ChatSessionListItem {
  return {
    id: row.id,
    title: row.title,
    last_message_at: row.lastMessageAt ? row.lastMessageAt.toISOString() : null,
    created_at: row.createdAt.toISOString()
  };
}

export function toChatSessionMessageItem(row: typeof chatMessages.$inferSelect): ChatSessionMessageItem {
  return {
    id: row.id,
    session_id: row.sessionId,
    role: row.role as ChatSessionMessageItem["role"],
    content: row.content,
    references:
      row.references?.map((reference) => ({
        article_id: reference.articleId,
        category_code: reference.categoryCode,
        title: reference.title
      })) ?? null,
    fallback_to_sm: row.fallbackToSm,
    created_at: row.createdAt.toISOString()
  };
}

export function toAdminRecentActivityItem(row: {
  messageId: number;
  sessionId: number;
  branchId: number;
  branchCode: string;
  branchName: string;
  message: string;
  createdAt: Date;
}): AdminRecentActivityItem {
  return {
    message_id: row.messageId,
    session_id: row.sessionId,
    branch_id: row.branchId,
    branch_code: row.branchCode,
    branch_name: row.branchName,
    message: row.message,
    created_at: row.createdAt.toISOString()
  };
}
