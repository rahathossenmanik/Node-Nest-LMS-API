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
import { UserDocument } from "src/schemas/user.schema";
import { Video } from "src/schemas/video.schema";
import { VideoService } from "src/services/video.service";

@ApiBearerAuth()
@ApiTags("Videos")
@Controller("videos")
export class VideosController {
  constructor(private videosService: VideoService) {}

  @Public()
  @Get("getcatalog")
  async findAllForCatalog(): Promise<Video[]> {
    return this.videosService.findAllForCatalog();
  }

  @Roles(Role.Instructor, Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Get("getlist")
  async findAllForEditorList(
    @Headers("user") user: UserDocument
  ): Promise<Video[]> {
    return this.videosService.findAllForEditorList();
  }

  @Public()
  @Get("getpaginatedcatalog")
  async findCatalogByPagination(
    @Query("page") page: string,
    @Query("perPage") perPage: string,
    @Query("query") query: string,
    @Headers("user") user: UserDocument
  ): Promise<IPaginatedResult<Video>> {
    return this.videosService.findPaginatedCatalog(page, perPage, query, user);
  }

  @Roles(Role.Instructor, Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Get("getpaginatedlist")
  async findListByPagination(
    @Query("page") page: string,
    @Query("perPage") perPage: string,
    @Query("query") query: string,
    @Headers("user") user: UserDocument
  ): Promise<IPaginatedResult<Video>> {
    return this.videosService.findPaginatedList(page, perPage, query, user);
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
  async findById(@Param("id") id: string): Promise<Video> {
    return this.videosService.findById(id);
  }

  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Get("getbyvideoid/:videoId")
  async findByVideoId(@Param("videoId") videoId: string): Promise<Video> {
    return this.videosService.findByVideoId(Number(videoId));
  }

  @Roles(Role.Instructor, Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Post("create")
  async create(@Body() video: Video): Promise<Video> {
    return this.videosService.create(video);
  }

  @Roles(Role.Instructor, Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Put("update/:id")
  async update(
    @Param("id") id: string,
    @Body() video: Video,
    @Headers("user") user: UserDocument
  ): Promise<Video> {
    return this.videosService.update(id, video, user);
  }

  @Roles(Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Post("block/:id")
  async block(@Param("id") id: string): Promise<Video> {
    return this.videosService.block(id);
  }

  @Roles(Role.Moderator, Role.Admin, Role.SuperAdmin)
  @Post("unblock/:id")
  async unblock(@Param("id") id: string): Promise<Video> {
    return this.videosService.unblock(id);
  }

  @Roles(Role.Instructor, Role.Admin, Role.SuperAdmin)
  @Delete("delete/:id")
  async delete(
    @Param("id") id: string,
    @Headers("user") user: UserDocument
  ): Promise<Video> {
    return this.videosService.delete(id, user);
  }
}
