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
import { Course } from "src/schemas/course.schema";
import { Progress } from "src/schemas/courseHistory.schema";
import { UserDocument } from "src/schemas/user.schema";
import { CourseService } from "src/services/course.service";

@ApiBearerAuth()
@ApiTags("Courses")
@Controller("courses")
export class CoursesController {
  constructor(private coursesService: CourseService) {}

  @Public()
  @Get("getpaginatedcatalog")
  async findCatalogByPagination(
    @Query("page") page: string,
    @Query("perPage") perPage: string,
    @Query("query") query: string,
    @Headers("user") user: UserDocument
  ): Promise<IPaginatedResult<Course>> {
    return this.coursesService.findPaginatedCatalog(page, perPage, query, user);
  }

  @Roles(Role.Instructor, Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Get("getpaginatedlist")
  async findListByPagination(
    @Query("page") page: string,
    @Query("perPage") perPage: string,
    @Query("query") query: string,
    @Headers("user") user: UserDocument
  ): Promise<IPaginatedResult<Course>> {
    return this.coursesService.findPaginatedList(page, perPage, query, user);
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
  ): Promise<IPaginatedResult<Course>> {
    return this.coursesService.findPaginatedCatalogByUser(
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
  async findById(@Param("id") id: string): Promise<Course> {
    return this.coursesService.findById(id);
  }

  @Public()
  @Get("getcoursepreview/:courseId")
  async findCoursePreviewByCourseId(
    @Param("courseId") courseId: string
  ): Promise<Course> {
    return this.coursesService.findCoursePreviewByCourseId(Number(courseId));
  }

  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Get("getbycourseid/:courseId")
  async findByCourseId(
    @Param("courseId") courseId: string,
    @Headers("user") user: UserDocument
  ): Promise<Course> {
    return this.coursesService.findByCourseId(Number(courseId), user);
  }

  @Roles(Role.Instructor, Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Post("create")
  async create(@Body() course: Course): Promise<Course> {
    return this.coursesService.create(course);
  }

  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Post("isenrolled")
  async isEnrolled(
    @Body() { courseId }: { courseId: number },
    @Headers("user") user: UserDocument
  ): Promise<Course> {
    return this.coursesService.isEnrolled(Number(courseId), user);
  }

  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Post("enrollcourse")
  async enrollCourse(
    @Body() { courseId }: { courseId: number },
    @Headers("user") user: UserDocument
  ): Promise<Course> {
    return this.coursesService.enrollCourse(Number(courseId), user);
  }

  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Post("updatecourseprogress")
  async updateCourseProgress(
    @Body() { courseId, progress }: { courseId: number; progress: Progress },
    @Headers("user") user: UserDocument
  ): Promise<Course> {
    return this.coursesService.updateCourseProgress(
      Number(courseId),
      progress,
      user
    );
  }

  @Roles(Role.Instructor, Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Put("update/:id")
  async update(
    @Param("id") id: string,
    @Body() course: Course,
    @Headers("user") user: UserDocument
  ): Promise<Course> {
    return this.coursesService.update(id, course, user);
  }

  @Roles(Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Post("block/:id")
  async block(@Param("id") id: string): Promise<Course> {
    return this.coursesService.block(id);
  }

  @Roles(Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Post("unblock/:id")
  async unblock(@Param("id") id: string): Promise<Course> {
    return this.coursesService.unblock(id);
  }

  @Roles(Role.Instructor, Role.Admin, Role.SuperAdmin)
  @Delete("delete/:id")
  async delete(
    @Param("id") id: string,
    @Headers("user") user: UserDocument
  ): Promise<Course> {
    return this.coursesService.delete(id, user);
  }
}
