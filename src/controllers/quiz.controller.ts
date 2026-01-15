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
import { Quiz } from "src/schemas/quiz.schema";
import {
  IQuizCompleteResponse,
  IQuizCompletionCheckResponse,
} from "src/schemas/quizHistory.schema";
import { UserDocument } from "src/schemas/user.schema";
import { QuizService } from "src/services/quiz.service";

@ApiBearerAuth()
@ApiTags("Quizzes")
@Controller("quizzes")
export class QuizzesController {
  constructor(private quizzesService: QuizService) {}

  @Roles(Role.Instructor, Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Get("getlist")
  async findAllForEditorList(
    @Headers("user") user: UserDocument
  ): Promise<Quiz[]> {
    return this.quizzesService.findAllForEditorList();
  }

  @Public()
  @Get("getpaginatedcatalog")
  async findCatalogByPagination(
    @Query("page") page: string,
    @Query("perPage") perPage: string,
    @Query("query") query: string,
    @Headers("user") user: UserDocument
  ): Promise<IPaginatedResult<Quiz>> {
    return this.quizzesService.findPaginatedCatalog(page, perPage, query, user);
  }

  @Roles(Role.Instructor, Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Get("getpaginatedlist")
  async findListByPagination(
    @Query("page") page: string,
    @Query("perPage") perPage: string,
    @Query("query") query: string,
    @Headers("user") user: UserDocument
  ): Promise<IPaginatedResult<Quiz>> {
    return this.quizzesService.findPaginatedList(page, perPage, query, user);
  }

  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Get("getpaginatedcatalogbyuser")
  async findPaginatedCatalogByUser(
    @Query("page") page: string,
    @Query("perPage") perPage: string,
    @Query("query") query: string,
    @Headers("user") user: UserDocument
  ): Promise<IPaginatedResult<Quiz>> {
    return this.quizzesService.findPaginatedCatalogByUser(
      page,
      perPage,
      query,
      user
    );
  }

  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Get("getbyid/:id")
  async findById(@Param("id") id: string): Promise<Quiz> {
    return this.quizzesService.findById(id);
  }

  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Get("getbyquizid/:quizId")
  async findByQuizId(@Param("quizId") quizId: string): Promise<Quiz> {
    return this.quizzesService.findByQuizId(Number(quizId));
  }

  @Roles(Role.Instructor, Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Post("create")
  async create(@Body() quiz: Quiz): Promise<Quiz> {
    return this.quizzesService.create(quiz);
  }
  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Post("iscompletedquiz")
  async isCompletedQuiz(
    @Body() { quizId }: { quizId: number },
    @Headers("user") user: UserDocument
  ): Promise<IQuizCompletionCheckResponse> {
    return this.quizzesService.isCompletedQuiz(quizId, user);
  }
  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Post("startquiz")
  async startQuiz(
    @Body() { quizId }: { quizId: number },
    @Headers("user") user: UserDocument
  ): Promise<Quiz> {
    return this.quizzesService.startQuiz(quizId, user);
  }
  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Post("submitquiz")
  async submitQuiz(
    @Body()
    {
      quizId,
      answers,
    }: {
      quizId: number;
      answers: { question: string; answer: string | number }[];
    },
    @Headers("user") user: UserDocument
  ): Promise<IQuizCompleteResponse> {
    return this.quizzesService.submitQuiz({ quizId, answers }, user);
  }

  @Roles(Role.Instructor, Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Put("update/:id")
  async update(
    @Param("id") id: string,
    @Body() quiz: Quiz,
    @Headers("user") user: UserDocument
  ): Promise<Quiz> {
    return this.quizzesService.update(id, quiz, user);
  }

  @Roles(Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Post("block/:id")
  async block(@Param("id") id: string): Promise<Quiz> {
    return this.quizzesService.block(id);
  }

  @Roles(Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Post("unblock/:id")
  async unblock(@Param("id") id: string): Promise<Quiz> {
    return this.quizzesService.unblock(id);
  }

  @Roles(Role.Instructor, Role.Admin, Role.SuperAdmin)
  @Delete("delete/:id")
  async delete(
    @Param("id") id: string,
    @Headers("user") user: UserDocument
  ): Promise<Quiz> {
    return this.quizzesService.delete(id, user);
  }
}
