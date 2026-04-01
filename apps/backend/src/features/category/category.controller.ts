import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import {
  CreateCategoryRequestSchema,
  UpdateCategoryRequestSchema,
  type CategorySummary,
  type CreateCategoryRequest,
  type UpdateCategoryRequest
} from "@bon/contracts";
import { AdminSessionGuard } from "../../common/guards/admin-session.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CategoryService } from "./category.service";

const createCategoryBodyPipe = new ZodValidationPipe(CreateCategoryRequestSchema);
const updateCategoryBodyPipe = new ZodValidationPipe(UpdateCategoryRequestSchema);

@UseGuards(AdminSessionGuard)
@Controller("admin/categories")
export class CategoryController {
  constructor(@Inject(CategoryService) private readonly categoryService: CategoryService) {}

  @Get()
  list(): Promise<CategorySummary[]> {
    return this.categoryService.listWithCounts();
  }

  @Post()
  create(@Body(createCategoryBodyPipe) body: CreateCategoryRequest): Promise<CategorySummary> {
    return this.categoryService.create(body);
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body(updateCategoryBodyPipe) body: UpdateCategoryRequest
  ): Promise<CategorySummary> {
    return this.categoryService.update(id, body);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number): Promise<{ success: true }> {
    await this.categoryService.softDelete(id);
    return { success: true };
  }
}
