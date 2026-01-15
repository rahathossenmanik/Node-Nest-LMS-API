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
import { Roles } from "src/decorators/role.decorator";
import { IPaginatedResult } from "src/interfaces/IPaginatedResult";
import {
  AuthOutput,
  ChangePasswordInput,
  ReadOnlyUser,
  User,
  UserDocument,
} from "src/schemas/user.schema";
import { UserService } from "src/services/user.service";

@ApiBearerAuth()
@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private usersService: UserService) {}

  @Roles(Role.Admin, Role.SuperAdmin)
  @Get("getall")
  async findAll(
    @Query("page") page: string,
    @Query("perPage") perPage: string,
    @Query("query") query: string
  ): Promise<IPaginatedResult<ReadOnlyUser>> {
    return this.usersService.findAll(page, perPage, query);
  }

  @Roles(Role.Admin, Role.SuperAdmin)
  @Get("getbyid/:id")
  async findById(@Param("id") id: string): Promise<ReadOnlyUser> {
    return this.usersService.findById(id);
  }

  @Roles(Role.Admin, Role.SuperAdmin)
  @Get("getbyuserid/:userId")
  async findByUserId(@Param("userId") userId: string): Promise<ReadOnlyUser> {
    return this.usersService.findByUserId(Number(userId));
  }

  @Roles(Role.Admin, Role.SuperAdmin)
  @Post("create")
  async create(@Body() user: User): Promise<User> {
    return this.usersService.create(user);
  }

  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Put("update")
  async update(
    @Headers("user") userMeta: UserDocument,
    @Body() user: User
  ): Promise<AuthOutput | Error> {
    return this.usersService.update(user, userMeta);
  }

  @Roles(Role.Admin, Role.SuperAdmin)
  @Put("changeuserrole")
  async changeUserRole(
    @Headers("user") userMeta: UserDocument,
    @Body() user: User
  ): Promise<User> {
    return this.usersService.changeUserRole(user, userMeta);
  }

  @Roles(Role.Admin, Role.SuperAdmin)
  @Delete("delete/:id")
  async delete(@Param("id") id: string): Promise<User> {
    return this.usersService.delete(id);
  }

  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Put("change-password")
  async changePassword(
    @Body() payload: ChangePasswordInput
  ): Promise<Error | { message: string }> {
    return this.usersService.changePassword(payload);
  }
}
