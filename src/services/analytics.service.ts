import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IDashboardSummary } from "src/interfaces/IDashboardSummary";
import { Article, ArticleDocument } from "src/schemas/article.schema";
import { Course, CourseDocument } from "src/schemas/course.schema";
import {
  CourseHistory,
  CourseHistoryDocument,
} from "src/schemas/courseHistory.schema";
import { Quiz, QuizDocument } from "src/schemas/quiz.schema";
import {
  QuizHistory,
  QuizHistoryDocument,
} from "src/schemas/quizHistory.schema";
import { UserDocument } from "src/schemas/user.schema";
import { Video, VideoDocument } from "src/schemas/video.schema";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Article.name)
    private articleModel: Model<ArticleDocument>,
    @InjectModel(Video.name)
    private videoModel: Model<VideoDocument>,
    @InjectModel(Quiz.name)
    private quizModel: Model<QuizDocument>,
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    @InjectModel(CourseHistory.name)
    private courseHistoryModel: Model<CourseHistoryDocument>,
    @InjectModel(QuizHistory.name)
    private quizHistoryModel: Model<QuizHistoryDocument>
  ) {}

  async getDashboardSummary(
    user: UserDocument = {} as UserDocument
  ): Promise<IDashboardSummary> {
    const userId = user?._id;

    const summary: IDashboardSummary = {} as IDashboardSummary;
    summary.totalArticles =
      (await this.articleModel.countDocuments().exec()) || 0;
    summary.totalVideos = (await this.videoModel.countDocuments().exec()) || 0;
    summary.totalQuizzes = (await this.quizModel.countDocuments().exec()) || 0;
    summary.totalCourses =
      (await this.courseModel.countDocuments().exec()) || 0;

    summary.enrolledCourses =
      (await this.courseHistoryModel.countDocuments({ userId }).exec()) || 0;
    summary.attendedQuizzes =
      (await this.quizHistoryModel
        .countDocuments({ userId, isFinished: true })
        .exec()) || 0;
    summary.passedQuizzes =
      (await this.quizHistoryModel
        .countDocuments({ userId, isFinished: true, isPassed: true })
        .exec()) || 0;
    summary.failedQuizzes =
      (await this.quizHistoryModel
        .countDocuments({ userId, isFinished: true, isPassed: false })
        .exec()) || 0;

    return summary;
  }
}
