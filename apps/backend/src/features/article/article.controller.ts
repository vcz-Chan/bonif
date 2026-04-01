import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, ParseIntPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import {
  CreateArticleImageUploadUrlRequestSchema,
  CreateArticleRequestSchema,
  ListArticlesQuerySchema,
  UpdateArticleRequestSchema,
  type ArticleSummary,
  type CreateArticleImageUploadUrlRequest,
  type CreateArticleImageUploadUrlResponse,
  type CreateArticleRequest,
  type ListArticlesQuery,
  type UpdateArticleRequest
} from "@bon/contracts";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AdminSessionGuard } from "../../common/guards/admin-session.guard";
import { ArticleAssetService } from "./article-asset.service";
import { ArticleService } from "./article.service";

const listArticlesQueryPipe = new ZodValidationPipe(ListArticlesQuerySchema);
const createArticleBodyPipe = new ZodValidationPipe(CreateArticleRequestSchema);
const createArticleImageUploadUrlBodyPipe = new ZodValidationPipe(CreateArticleImageUploadUrlRequestSchema);
const updateArticleBodyPipe = new ZodValidationPipe(UpdateArticleRequestSchema);

@UseGuards(AdminSessionGuard)
@Controller("admin/articles")
export class ArticleController {
  constructor(
    @Inject(ArticleService) private readonly articleService: ArticleService,
    @Inject(ArticleAssetService) private readonly articleAssetService: ArticleAssetService
  ) {}

  @Get()
  async list(
    @Query(listArticlesQueryPipe) query: ListArticlesQuery
  ): Promise<{ items: ArticleSummary[]; total: number }> {
    const result = await this.articleService.list(query);

    return { items: result.data, total: result.total };
  }

  @Get(":id")
  async get(@Param("id", ParseIntPipe) id: number): Promise<ArticleSummary> {
    const article = await this.articleService.get(id);
    if (!article) {
      throw new NotFoundException("문서를 찾을 수 없습니다.");
    }

    return article;
  }

  @Post()
  create(@Body(createArticleBodyPipe) body: CreateArticleRequest): Promise<{ id: number }> {
    return this.articleService.create(body);
  }

  @Post("presigned-upload")
  createPresignedUpload(
    @Body(createArticleImageUploadUrlBodyPipe) body: CreateArticleImageUploadUrlRequest
  ): Promise<CreateArticleImageUploadUrlResponse> {
    return this.articleAssetService.createImageUploadUrl({
      fileName: body.file_name,
      contentType: body.content_type
    });
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body(updateArticleBodyPipe) body: UpdateArticleRequest
  ): Promise<{ id: number }> {
    return this.articleService.update(id, body);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number): Promise<{ success: true }> {
    await this.articleService.delete(id);
    return { success: true };
  }
}
