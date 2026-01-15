import { Controller, Get, Headers } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "src/constants/enums/role.enum";
import { Roles } from "src/decorators/role.decorator";
import { IDashboardSummary } from "src/interfaces/IDashboardSummary";
import { UserDocument } from "src/schemas/user.schema";
import { AnalyticsService } from "src/services/analytics.service";

@ApiBearerAuth()
@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Roles(
    Role.User,
    Role.Writer,
    Role.Instructor,
    Role.Moderator,
    Role.Admin,
    Role.SuperAdmin
  )
  @Get("getdashboardsummary")
  async findAll(
    @Headers("user") user: UserDocument
  ): Promise<IDashboardSummary> {
    return this.analyticsService.getDashboardSummary(user);
  }
}
