import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { CONTENT_TYPE } from "src/constants/enums/contentType.enum";
import { Role } from "src/constants/enums/role.enum";
import { IPaginatedResult } from "src/interfaces/IPaginatedResult";
import { Article, ArticleDocument } from "src/schemas/article.schema";
import { Course, CourseDocument } from "src/schemas/course.schema";
import {
  CourseHistory,
  CourseHistoryDocument,
  Progress,
} from "src/schemas/courseHistory.schema";
import { Quiz, QuizDocument } from "src/schemas/quiz.schema";
import { UserDocument } from "src/schemas/user.schema";
import { Video, VideoDocument } from "src/schemas/video.schema";

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(CourseHistory.name)
    private courseHistoryModel: Model<CourseHistoryDocument>
  ) {}

  async findPaginatedCatalog(
    page: string = "1",
    perPage: string = "12",
    query: string = "",
    user: UserDocument = {} as UserDocument
  ): Promise<IPaginatedResult<Course>> {
    const userId = user?._id;
    const filter: FilterQuery<Course> = query
      ? {
          $or: [{ title: new RegExp(query, "i") }],
        }
      : {};

    const data: any = await this.courseModel
      .find({ ...filter, status: { $ne: "Blocked" } })
      .select("-courseIndex")
      .populate("instructor", ["_id", "name"])
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .lean()
      .exec();
    const totalCount = await this.courseModel.countDocuments(filter).exec();

    if (userId) {
      for (let i = 0; i < data?.length; i++) {
        const { courseId } = data[i];
        const { isEnrolled } =
          (await this.courseHistoryModel.findOne({
            courseId,
            userId,
          })) || {};
        if (isEnrolled) {
          data[i].isEnrolled = true;
        }
      }
    }

    return { data, totalCount };
  }

  async findPaginatedList(
    page: string = "1",
    perPage: string = "12",
    query: string = "",
    user: UserDocument = {} as UserDocument
  ): Promise<IPaginatedResult<Course>> {
    const userId = user?._id;
    const filter: FilterQuery<Course> = query
      ? {
          $or: [{ title: new RegExp(query, "i") }],
        }
      : {};

    if (user?.role === Role.Instructor && userId) filter.instructor = userId;

    const data = await this.courseModel
      .find(filter)
      .populate("instructor", ["_id", "name"])
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .lean()
      .exec();
    const totalCount = await this.courseModel.countDocuments(filter).exec();

    return { data, totalCount };
  }

  async findPaginatedCatalogByUser(
    page: string = "1",
    perPage: string = "12",
    query: string = "",
    user: UserDocument = {} as UserDocument
  ): Promise<IPaginatedResult<Course>> {
    const userId = user?._id;
    const courseHistories = await this.courseHistoryModel
      .find({
        userId,
        isEnrolled: true,
      })
      .select("courseId")
      .lean()
      .exec();
    // Extract courseId values from courseHistories
    const courseIds = courseHistories.map((history) => history.courseId);
    if (courseIds?.length === 0) {
      return { data: [], totalCount: 0 };
    }

    const filter: FilterQuery<Course> = {
      courseId: { $in: courseIds },
    };
    if (query) filter["$or"] = [{ title: new RegExp(query, "i") }];

    const data: any = await this.courseModel
      .find(filter)
      .select("-courseIndex")
      .populate("instructor", ["_id", "name"])
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .lean()
      .exec();
    const totalCount = await this.courseModel.countDocuments(filter).exec();

    if (userId) {
      for (let i = 0; i < data?.length; i++) {
        data[i].isEnrolled = true;
      }
    }

    return { data, totalCount };
  }

  async findById(id: string): Promise<Course> {
    return this.courseModel
      .findById(id)
      .populate("instructor", ["_id", "name"])
      .exec();
  }

  async findCoursePreviewByCourseId(courseId: number): Promise<Course> {
    const course = await this.courseModel
      .findOne({ courseId })
      .populate("instructor", ["_id", "name"])
      .exec();
    if (!course)
      throw new NotFoundException(
        "Course not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    if (course?.status === "Blocked") {
      throw new ForbiddenException(
        "This course is blocked! It is no longer accessible by users."
      );
    }

    // Iterate over the 2D array and populate each contentId
    for (let i = 0; i < course.courseIndex.length; i++) {
      for (let j = 0; j < course.courseIndex[i].length; j++) {
        const module = course.courseIndex[i][j];
        const model: any = this.getModelForContentType(module.contentType);
        if (model) {
          module.contentId = await model
            .findById(module.contentId)
            .select(["_id", "title"])
            .exec();
        }
      }
    }

    return course;
  }

  async findByCourseId(
    courseId: number,
    user: UserDocument = {} as UserDocument
  ): Promise<Course> {
    const userId = user?._id;
    const course = await this.courseModel
      .findOne({ courseId })
      .populate("instructor", ["_id", "name"])
      .lean()
      .exec();
    if (!course)
      throw new NotFoundException(
        "Course not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    if (course?.status === "Blocked") {
      throw new ForbiddenException(
        "This course is blocked! It is no longer accessible by users."
      );
    }

    const courseHistory = await this.courseHistoryModel
      .findOne({ courseId, userId })
      .lean()
      .exec();

    // Iterate over the 2D array and populate each contentId
    for (let i = 0; i < course.courseIndex.length; i++) {
      for (let j = 0; j < course.courseIndex[i].length; j++) {
        const module: any = course.courseIndex[i][j];
        const model: any = this.getModelForContentType(module.contentType);
        if (model) {
          module.contentId = await model
            .findById(module.contentId)
            .lean()
            .exec();
          if (courseHistory) {
            const { progress } = courseHistory;
            const moduleProgress = progress?.find(
              (module) => module?.weekNo - 1 === i && module?.moduleNo - 1 === j
            );
            if (moduleProgress) {
              const { isCompleted } = moduleProgress;
              if (isCompleted) module.isCompleted = true;
            }
          }
        }
      }
    }

    return course;
  }

  async create(course: Course): Promise<Course> {
    const { courseId: lastCourseId } =
      (await this.courseModel
        .findOne()
        .sort({ courseId: -1 })
        .select("courseId")
        .exec()) || {};
    course.courseId = (Number(lastCourseId) || 1000) + 1;
    const createdCourse = new this.courseModel(course);
    return createdCourse.save();
  }

  async isEnrolled(
    courseId: number,
    user: UserDocument = {} as UserDocument
  ): Promise<any> {
    let course = await this.findCoursePreviewByCourseId(courseId);
    if (!course)
      throw new NotFoundException(
        "Course not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    if (course?.status === "Blocked") {
      throw new ForbiddenException(
        "This course is blocked! It is no longer accessible by users."
      );
    }
    const userId = user?._id;
    const { isEnrolled = false } =
      (await this.courseHistoryModel.findOne({
        courseId,
        userId,
      })) || {};
    if (isEnrolled) {
      course = await this.findByCourseId(courseId, user);
    }
    return { course, isEnrolled };
  }

  async enrollCourse(
    courseId: number,
    user: UserDocument = {} as UserDocument
  ): Promise<any> {
    const course = await this.courseModel.findOne({ courseId }).exec();
    if (!course)
      throw new NotFoundException(
        "Course not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    if (course?.status === "Blocked") {
      throw new ForbiddenException(
        "This course is blocked! It is no longer accessible by users."
      );
    }
    const userId = user?._id;
    const courseHistory = (await this.courseHistoryModel
      .findOne({ courseId, userId })
      .exec()) || { isEligible: true, isBlocked: false, isEnrolled: false };
    const { isEligible, isBlocked, isEnrolled } = courseHistory;
    if (isBlocked) throw new Error("Course is Blocked for the user.");
    if (isEnrolled)
      throw new Error(
        "Invalid operation! You have already enrolled this course."
      );
    if (isEligible) {
      const courseHistoryPayload = {
        courseId,
        userId,
        isEnrolled: true,
        startDate: new Date(),
        isFinished: false,
        progress: [],
      };
      const courseHistoryRes = await this.courseHistoryModel.findOneAndUpdate(
        { courseId, userId },
        courseHistoryPayload,
        { upsert: true, new: true }
      );

      const courseRes = await this.courseModel.findOneAndUpdate({ courseId }, [
        {
          $addFields: {
            numStudents: { $ifNull: ["$numStudents", 0] },
          },
        },
        {
          $set: {
            numStudents: { $add: ["$numStudents", 1] },
          },
        },
      ]);

      if (courseHistoryRes && courseRes) return this.findByCourseId(courseId);
    }
    throw new Error("Unable to enroll Course.");
  }

  async updateCourseProgress(
    courseId: number,
    progress: Progress,
    user: UserDocument = {} as UserDocument
  ): Promise<any> {
    const course = await this.courseModel.findOne({ courseId }).exec();
    if (!course)
      throw new NotFoundException(
        "Course not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    if (course?.status === "Blocked") {
      throw new ForbiddenException(
        "This course is blocked! It is no longer accessible by users."
      );
    }
    const userId = user?._id;
    const courseHistoryUpdatePayload = await this.courseHistoryModel
      .findOne({ courseId, userId })
      .lean()
      .exec();
    courseHistoryUpdatePayload.progress = [
      ...courseHistoryUpdatePayload.progress,
      progress,
    ];
    const courseHistoryRes = await this.courseHistoryModel.findOneAndUpdate(
      { courseId, userId },
      courseHistoryUpdatePayload,
      { new: true }
    );

    if (courseHistoryRes) {
      return courseHistoryRes;
    }

    throw new Error("Failed to update course progress.");
  }

  async update(
    id: string,
    course: Course,
    user: UserDocument = {} as UserDocument
  ): Promise<Course> {
    const filter: any = { _id: id };
    if (user?.role === Role.Instructor) filter.instructor = user?._id;
    const newCourse = await this.courseModel.findOneAndUpdate(filter, course, {
      new: true,
    });
    if (!newCourse)
      throw new NotFoundException(
        "Course not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newCourse;
  }

  async block(id: string): Promise<Course> {
    const newCourse = await this.courseModel.findByIdAndUpdate(
      id,
      { status: "Blocked" },
      { new: true }
    );
    if (!newCourse)
      throw new NotFoundException(
        "Course not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newCourse;
  }

  async unblock(id: string): Promise<Course> {
    const newCourse = await this.courseModel.findByIdAndUpdate(
      id,
      { status: "Active" },
      { new: true }
    );
    if (!newCourse)
      throw new NotFoundException(
        "Course not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newCourse;
  }

  async delete(
    id: string,
    user: UserDocument = {} as UserDocument
  ): Promise<Course> {
    const filter: any = { _id: id };
    if (user?.role === Role.Instructor) filter.instructor = user?._id;
    const deletedCourse = await this.courseModel.findOne(filter).exec();
    if (!deletedCourse)
      throw new NotFoundException(
        "Course not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    await this.courseModel.findOneAndRemove(filter).exec();
    return deletedCourse;
  }

  private getModelForContentType(contentType: CONTENT_TYPE) {
    switch (contentType) {
      case "Article":
        return this.articleModel;
      case "Quiz":
        return this.quizModel;
      case "Video":
        return this.videoModel;
      default:
        return null;
    }
  }
}
