import { z } from "zod";
import {
  optionalNullableBoolean,
  optionalPositiveInt,
  optionalTrimmedString,
  requiredTrimmedString
} from "./schema-helpers";

export const UiMessageRoleSchema = z.enum(["user", "assistant"]);
export type UiMessageRole = z.infer<typeof UiMessageRoleSchema>;

export const ChatReferenceSchema = z.object({
  article_id: z.coerce.number().int().min(1),
  category_code: z.string().max(50),
  title: z.string().max(200).optional()
}).strict();
export type ChatReference = z.infer<typeof ChatReferenceSchema>;

export interface UiMessage {
  id?: string;
  role: UiMessageRole;
  content: string;
  references?: ChatReference[];
}

export interface ChatSessionListItem {
  id: number;
  title: string | null;
  last_message_at: string | null;
  created_at: string;
}

export interface ChatSessionMessageItem {
  id: number;
  session_id: number;
  role: UiMessageRole;
  content: string;
  references?: ChatReference[] | null;
  fallback_to_sm?: boolean | null;
  created_at: string;
}

export const CreateChatSessionRequestSchema = z.object({
  title: optionalTrimmedString(120)
}).strict();
export type CreateChatSessionRequest = z.infer<typeof CreateChatSessionRequestSchema>;

export const CreateChatMessageRequestSchema = z.object({
  content: requiredTrimmedString(),
  role: UiMessageRoleSchema,
  references: z.array(ChatReferenceSchema).nullable().optional(),
  fallback_to_sm: optionalNullableBoolean()
}).strict();
export type CreateChatMessageRequest = z.infer<typeof CreateChatMessageRequestSchema>;

export const ChatRequestSchema = z.object({
  question: requiredTrimmedString(),
  session_id: optionalPositiveInt()
}).strict();
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export interface ChatResponse {
  answer: string;
  session_id: number;
  fallback_to_sm: boolean;
  references: ChatReference[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  cost?: {
    prompt_cost?: number;
    completion_cost?: number;
    total_cost?: number;
  };
}
