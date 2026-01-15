import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Headers,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "src/constants/enums/role.enum";
import { Public } from "src/decorators/public.decorator";
import { Roles } from "src/decorators/role.decorator";
import { IPaginatedResult } from "src/interfaces/IPaginatedResult";
import { Article } from "src/schemas/article.schema";
import { UserDocument } from "src/schemas/user.schema";
import { ArticleService } from "src/services/article.service";

@ApiBearerAuth()
@ApiTags("Articles")
@Controller("articles")
export class ArticlesController {
  constructor(private articlesService: ArticleService) {}

  @Public()
  @Get("getcatalog")
  async findAllForCatalog(): Promise<Article[]> {
    return this.articlesService.findAllForCatalog();
  }

  @Roles(
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Get("getlist")
  async findAllForEditorList(
    @Headers("user") user: UserDocument
  ): Promise<Article[]> {
    return this.articlesService.findAllForEditorList();
  }

  @Public()
  @Get("getpaginatedcatalog")
  async findCatalogByPagination(
    @Query("page") page: string,
    @Query("perPage") perPage: string,
    @Query("query") query: string
  ): Promise<IPaginatedResult<Article>> {
    return this.articlesService.findPaginatedCatalog(page, perPage, query);
  }

  @Roles(
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Get("getpaginatedlist")
  async findListByPagination(
    @Query("page") page: string,
    @Query("perPage") perPage: string,
    @Query("query") query: string,
    @Headers("user") user: UserDocument
  ): Promise<IPaginatedResult<Article>> {
    return this.articlesService.findPaginatedList(page, perPage, query, user);
  }

  @Public()
  @Get("getbyid/:id")
  async findById(@Param("id") id: string): Promise<Article> {
    return this.articlesService.findById(id);
  }

  @Public()
  @Get("getbyarticleid/:articleId")
  async findByArticleId(
    @Param("articleId") articleId: string
  ): Promise<Article> {
    return this.articlesService.findByArticleId(Number(articleId));
  }

  @Roles(
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Post("create")
  async create(@Body() article: Article): Promise<Article> {
    return this.articlesService.create(article);
  }

  @Roles(
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Put("update/:id")
  async update(
    @Param("id") id: string,
    @Body() article: Article,
    @Headers("user") user: UserDocument
  ): Promise<Article> {
    return this.articlesService.update(id, article, user);
  }

  @Roles(Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Post("block/:id")
  async block(@Param("id") id: string): Promise<Article> {
    return this.articlesService.block(id);
  }

  @Roles(Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Post("unblock/:id")
  async unblock(@Param("id") id: string): Promise<Article> {
    return this.articlesService.unblock(id);
  }

  @Roles(Role.Writer, Role.Instructor, Role.Admin, Role.SuperAdmin)
  @Delete("delete/:id")
  async delete(
    @Param("id") id: string,
    @Headers("user") user: UserDocument
  ): Promise<Article> {
    return this.articlesService.delete(id, user);
  }
}
