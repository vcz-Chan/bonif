import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { ChatRequestSchema, type ChatRequest } from "@bon/contracts";
import { AdminSessionGuard } from "../../common/guards/admin-session.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { ChatService } from "./chat.service";

const chatPreviewBodyPipe = new ZodValidationPipe(ChatRequestSchema);

@UseGuards(AdminSessionGuard)
@Controller("admin")
export class ChatPreviewController {
  constructor(@Inject(ChatService) private readonly chatService: ChatService) {}

  @Post("preview-chat")
  async preview(@Body(chatPreviewBodyPipe) body: ChatRequest) {
    return this.chatService.getAnswer(body.question, { includeChunks: true });
  }
}
