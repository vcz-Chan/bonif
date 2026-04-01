import { Body, Controller, Get, Inject, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import {
  CreateBranchRequestSchema,
  UpdateBranchRequestSchema,
  type BranchSummary,
  type CreateBranchRequest,
  type UpdateBranchRequest
} from "@bon/contracts";
import { AdminSessionGuard } from "../../common/guards/admin-session.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { BranchService } from "./branch.service";

const createBranchBodyPipe = new ZodValidationPipe(CreateBranchRequestSchema);
const updateBranchBodyPipe = new ZodValidationPipe(UpdateBranchRequestSchema);

@UseGuards(AdminSessionGuard)
@Controller("admin/branches")
export class BranchController {
  constructor(@Inject(BranchService) private readonly branchService: BranchService) {}

  @Get()
  list(): Promise<BranchSummary[]> {
    return this.branchService.list();
  }

  @Post()
  create(@Body(createBranchBodyPipe) body: CreateBranchRequest): Promise<BranchSummary> {
    return this.branchService.create(body);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body(updateBranchBodyPipe) body: UpdateBranchRequest
  ): Promise<BranchSummary> {
    return this.branchService.update(id, body);
  }
}
