import { FileSchema } from "./../schemas/file.schema";
import { ErrorModule } from "./error.module";
require("dotenv").config({ path: ".env" });
import { AuthModule } from "./auth.module";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LogSchema } from "src/schemas/log.schema";
import { LogsController } from "src/controllers/log.controller";
import { LogService } from "src/services/log.service";
import { UserSchema } from "src/schemas/user.schema";
import { UsersController } from "src/controllers/user.controller";
import { UserService } from "src/services/user.service";
import { ArticleSchema } from "src/schemas/article.schema";
import { ArticlesController } from "src/controllers/article.controller";
import { ArticleService } from "src/services/article.service";
import { QuizSchema } from "src/schemas/quiz.schema";
import { QuizzesController } from "src/controllers/quiz.controller";
import { QuizService } from "src/services/quiz.service";
import { VideoSchema } from "src/schemas/video.schema";
import { VideosController } from "src/controllers/video.controller";
import { VideoService } from "src/services/video.service";
import { CourseSchema } from "src/schemas/course.schema";
import { CoursesController } from "src/controllers/course.controller";
import { CourseService } from "src/services/course.service";
import { QuizHistorySchema } from "src/schemas/quizHistory.schema";
import { CourseHistorySchema } from "src/schemas/courseHistory.schema";
import { AnalyticsController } from "src/controllers/analytics.controller";
import { AnalyticsService } from "src/services/analytics.service";
import { FileController } from "src/controllers/file.controller";
import { FileService } from "src/services/file.service";

const mongo_uri = process.env.DATABASE_URL;

@Module({
  imports: [
    ErrorModule,
    AuthModule,
    MongooseModule.forRoot(mongo_uri),
    MongooseModule.forFeature([
      { name: "Log", schema: LogSchema },
      { name: "User", schema: UserSchema },
      { name: "Article", schema: ArticleSchema },
      { name: "Quiz", schema: QuizSchema },
      { name: "Video", schema: VideoSchema },
      { name: "Course", schema: CourseSchema },
      { name: "QuizHistory", schema: QuizHistorySchema },
      { name: "CourseHistory", schema: CourseHistorySchema },
      { name: "File", schema: FileSchema },
    ]),
  ],
  controllers: [
    LogsController,
    UsersController,
    ArticlesController,
    QuizzesController,
    VideosController,
    CoursesController,
    AnalyticsController,
    FileController,
  ],
  providers: [
    LogService,
    UserService,
    ArticleService,
    QuizService,
    VideoService,
    CourseService,
    AnalyticsService,
    FileService,
  ],
})
export class AppModule {}
