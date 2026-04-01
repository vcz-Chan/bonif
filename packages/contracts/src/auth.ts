import { z } from "zod";
import { requiredTrimmedString } from "./schema-helpers";

export const LegacyAuthModeSchema = z.enum(["admin", "user"]);
export type LegacyAuthMode = z.infer<typeof LegacyAuthModeSchema>;

export const VerifyPasswordRequestSchema = z.object({
  mode: LegacyAuthModeSchema,
  password: z.string().min(1)
}).strict();
export type VerifyPasswordRequest = z.infer<typeof VerifyPasswordRequestSchema>;

export interface VerifyPasswordResponse {
  role: "admin" | "branch";
  adminId?: number;
  branchId?: number;
  branchCode?: string;
  branchName?: string;
}

export const AdminLoginRequestSchema = z.object({
  username: requiredTrimmedString(),
  password: z.string().min(1)
}).strict();
export type AdminLoginRequest = z.infer<typeof AdminLoginRequestSchema>;

export const BranchLoginRequestSchema = z.object({
  codeOrName: requiredTrimmedString(),
  password: z.string().min(1)
}).strict();
export type BranchLoginRequest = z.infer<typeof BranchLoginRequestSchema>;

export interface AuthUserPayload {
  role: "admin" | "branch";
  adminId?: number;
  branchId?: number;
  branchCode?: string;
  branchName?: string;
}

export type LoginResponse = AuthUserPayload;
