import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Role } from "src/constants/enums/role.enum";
import { MS_PER_SECONDS } from "src/helpers/common.helpers";
import { IPaginatedResult } from "src/interfaces/IPaginatedResult";
import { Quiz, QuizDocument } from "src/schemas/quiz.schema";
import {
  IQuizCompleteResponse,
  IQuizCompletionCheckResponse,
  QuizHistory,
  QuizHistoryDocument,
} from "src/schemas/quizHistory.schema";
import { UserDocument } from "src/schemas/user.schema";

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name)
    private quizModel: Model<QuizDocument>,
    @InjectModel(QuizHistory.name)
    private quizHistoryModel: Model<QuizHistoryDocument>
  ) {}

  async findAllForEditorList(
    user: UserDocument = {} as UserDocument
  ): Promise<Quiz[]> {
    const userId = user?._id;
    const role = user?.role;
    const filter: FilterQuery<Quiz> = {};
    if (!user || role === Role.User || role === Role.Writer)
      throw new UnauthorizedException("Unauthorized Access");
    if (role === Role.Instructor && userId) filter.instructor = userId;
    return this.quizModel
      .find({ ...filter, status: { $ne: "Blocked" } })
      .populate("instructor", ["_id", "name"])
      .exec();
  }

  async findPaginatedCatalog(
    page: string = "1",
    perPage: string = "12",
    query: string = "",
    user: UserDocument = {} as UserDocument
  ): Promise<IPaginatedResult<Quiz>> {
    const userId = user?._id;
    const filter: FilterQuery<Quiz> = query
      ? {
          $or: [{ title: new RegExp(query, "i") }],
        }
      : {};

    const data: any = await this.quizModel
      .find({ ...filter, status: { $ne: "Blocked" } })
      .select("-questions")
      .populate("instructor", ["_id", "name"])
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .lean()
      .exec();
    const totalCount = await this.quizModel.countDocuments(filter).exec();

    if (userId) {
      for (let i = 0; i < data?.length; i++) {
        const { quizId } = data[i];
        const { isFinished } =
          (await this.quizHistoryModel.findOne({
            quizId,
            userId,
          })) || {};
        if (isFinished) {
          data[i].isFinished = true;
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
  ): Promise<IPaginatedResult<Quiz>> {
    const userId = user?._id;
    const filter: FilterQuery<Quiz> = query
      ? {
          $or: [{ title: new RegExp(query, "i") }],
        }
      : {};

    if (user?.role === Role.Instructor && userId) filter.instructor = userId;

    const data = await this.quizModel
      .find(filter)
      .populate("instructor", ["_id", "name"])
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .lean()
      .exec();
    const totalCount = await this.quizModel.countDocuments(filter).exec();

    return { data, totalCount };
  }

  async findPaginatedCatalogByUser(
    page: string = "1",
    perPage: string = "12",
    query: string = "",
    user: UserDocument = {} as UserDocument
  ): Promise<IPaginatedResult<Quiz>> {
    const userId = user?._id;
    const quizHistories = await this.quizHistoryModel
      .find({
        userId,
        isFinished: true,
      })
      .select("quizId")
      .lean()
      .exec();
    // Extract quizId values from quizHistories
    const quizIds = quizHistories.map((history) => history.quizId);
    if (quizIds?.length === 0) {
      return { data: [], totalCount: 0 };
    }

    const filter: FilterQuery<Quiz> = {
      quizId: { $in: quizIds },
    };
    if (query) filter["$or"] = [{ title: new RegExp(query, "i") }];

    const data: any = await this.quizModel
      .find(filter)
      .select("-questions")
      .populate("instructor", ["_id", "name"])
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .lean()
      .exec();
    const totalCount = await this.quizModel.countDocuments(filter).exec();

    if (userId) {
      for (let i = 0; i < data?.length; i++) {
        data[i].isFinished = true;
      }
    }

    return { data, totalCount };
  }

  async findById(id: string): Promise<Quiz> {
    return this.quizModel
      .findById(id)
      .select("-questions.answer")
      .populate("instructor", ["_id", "name"])
      .exec();
  }

  async findByQuizId(quizId: number): Promise<Quiz> {
    const quiz = await this.quizModel
      .findOne({ quizId })
      .select("-questions.answer")
      .populate("instructor", ["_id", "name"])
      .lean()
      .exec();
    if (!quiz)
      throw new NotFoundException(
        "Quiz not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    if (quiz?.status === "Blocked") {
      throw new ForbiddenException(
        "This quiz is blocked! It is no longer accessible by users."
      );
    }
    return quiz;
  }

  async create(quiz: Quiz): Promise<Quiz> {
    const { quizId: lastQuizId } =
      (await this.quizModel
        .findOne()
        .sort({ quizId: -1 })
        .select("quizId")
        .exec()) || {};
    quiz.quizId = (Number(lastQuizId) || 1000) + 1;
    const createdQuiz = new this.quizModel(quiz);
    return createdQuiz.save();
  }

  async isCompletedQuiz(
    quizId: number,
    user: UserDocument
  ): Promise<IQuizCompletionCheckResponse> {
    const quiz = await this.quizModel.findOne({ quizId }).exec();
    if (!quiz)
      throw new NotFoundException(
        "Quiz not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    if (quiz?.status === "Blocked") {
      throw new ForbiddenException(
        "This quiz is blocked! It is no longer accessible by users."
      );
    }
    const userId = user?._id;
    const quizHistory = await this.quizHistoryModel.findOne({
      quizId,
      userId,
    });
    const {
      isFinished = false,
      isStarted = false,
      answers = [],
    } = quizHistory || {};
    if (isFinished && answers) {
      const { questions, passGrade }: any = quiz;

      let correctCount = 0;
      questions?.forEach((question) => {
        const userAnswer = answers.find(
          (answer) => answer?.question === String(question?._id)
        );
        if (userAnswer && question?.answer === userAnswer.answer)
          correctCount++;
      });
      const totalCount = questions?.length;
      const grade = (correctCount / totalCount) * 100;
      const isPassed = grade >= passGrade;
      const resObject = {
        isPassed,
        score: grade,
        passGrade: passGrade,
        totalQuestions: totalCount,
        correctAnswers: correctCount,
        userAnswers: answers,
        questions,
      };
      return { isFinished: true, quizHistory: resObject };
    } else if (isStarted) return { isFinished, isStarted, quizHistory: null };
    return { isFinished: false, quizHistory: null };
  }

  async startQuiz(quizId: number, user: UserDocument): Promise<Quiz> {
    const quiz = await this.quizModel.findOne({ quizId }).lean().exec();
    if (!quiz)
      throw new NotFoundException(
        "Quiz not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    if (quiz?.status === "Blocked") {
      throw new ForbiddenException(
        "This quiz is blocked! It is no longer accessible by users."
      );
    }
    const userId = user?._id;
    const quizHistory: Partial<QuizHistoryDocument> =
      await this.quizHistoryModel.findOne({ quizId, userId }).lean().exec();
    const {
      isEligible = true,
      isBlocked = false,
      isStarted = false,
    } = quizHistory || {};
    if (isBlocked) throw new Error("Quiz is Blocked for the user.");

    // If quiz is started already
    if (isStarted) {
      const startTime = new Date(quizHistory?.startDate);
      const timeLimitInMin = quiz?.timeLimit || 0; // Time limit in minutes
      const currentTime = new Date();
      // Calculate the elapsed time in milliseconds
      const elapsedTime = currentTime.getTime() - startTime.getTime();
      // Convert the time limit from minutes to milliseconds
      const timeLimitInMS = timeLimitInMin * MS_PER_SECONDS;
      // Calculate the remaining time in milliseconds
      const remainingTimeInMS = timeLimitInMS - elapsedTime;
      if (remainingTimeInMS <= 0) {
        this.submitQuiz({ quizId, answers: [] }, user);
        throw new BadRequestException(
          "Quiz time is expired! Please refresh after a while."
        );
      } else if (quizHistory) {
        const quiz = await this.findByQuizId(quizId);
        quiz.timeLimit = Math.floor(remainingTimeInMS / MS_PER_SECONDS);
        return quiz;
      }
    }

    // If quiz is not started already
    if (isEligible) {
      const quizHistoryPayload = {
        quizId,
        userId,
        isStarted: true,
        startDate: quizHistory?.startDate || new Date(),
        isFinished: false,
        isPassed: false,
      };
      const quizHistoryRes = await this.quizHistoryModel.findOneAndUpdate(
        { quizId, userId },
        quizHistoryPayload,
        { upsert: true, new: true }
      );

      setTimeout(async () => {
        const quizStatus = await this.isCompletedQuiz(quizId, user);
        const { isFinished } = quizStatus;
        if (!isFinished) {
          this.submitQuiz({ quizId, answers: [] }, user);
        }
      }, quiz?.timeLimit * MS_PER_SECONDS);

      if (quizHistoryRes) return this.findByQuizId(quizId);
    }
    throw new Error("Unable to start Quiz.");
  }

  async submitQuiz(
    {
      quizId,
      answers,
    }: {
      quizId: number;
      answers: { question: string; answer: string | number }[];
    },
    user: UserDocument
  ): Promise<IQuizCompleteResponse> {
    const quiz = await this.quizModel.findOne({ quizId }).exec();
    if (!quiz)
      throw new NotFoundException(
        "Quiz not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    if (quiz?.status === "Blocked") {
      throw new ForbiddenException(
        "This quiz is blocked! It is no longer accessible by users."
      );
    }
    const userId = user?._id;
    const { questions, passGrade }: any = quiz;

    let correctCount = 0;
    questions?.forEach((question) => {
      const userAnswer = answers.find(
        (answer) => answer?.question === String(question?._id)
      );
      if (userAnswer && question?.answer === userAnswer.answer) correctCount++;
    });
    const totalCount = questions?.length;
    const grade = (correctCount / totalCount) * 100;
    const isPassed = grade >= passGrade;

    const quizHistoryPayload = {
      quizId,
      userId,
      isFinished: true,
      finishDate: new Date(),
      isPassed,
      score: grade,
      answers,
      status: isPassed ? "Passed" : "Failed",
    };
    const quizHistoryRes = await this.quizHistoryModel.findOneAndUpdate(
      { quizId, userId },
      quizHistoryPayload,
      { upsert: true }
    );

    if (quizHistoryRes) {
      const resObject = {
        isPassed,
        score: grade,
        passGrade: passGrade,
        totalQuestions: totalCount,
        correctAnswers: correctCount,
        userAnswers: answers,
        questions,
      };
      return resObject;
    }

    throw new Error("Failed to update quiz progress.");
  }

  async update(
    id: string,
    quiz: Quiz,
    user: UserDocument = {} as UserDocument
  ): Promise<Quiz> {
    const filter: any = { _id: id };
    if (user?.role === Role.Instructor) filter.instructor = user?._id;
    const newQuiz = await this.quizModel.findOneAndUpdate(filter, quiz, {
      new: true,
    });
    if (!newQuiz)
      throw new NotFoundException(
        "Quiz not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newQuiz;
  }

  async block(id: string): Promise<Quiz> {
    const newQuiz = await this.quizModel.findByIdAndUpdate(
      id,
      { status: "Blocked" },
      { new: true }
    );
    if (!newQuiz)
      throw new NotFoundException(
        "Quiz not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newQuiz;
  }

  async unblock(id: string): Promise<Quiz> {
    const newQuiz = await this.quizModel.findByIdAndUpdate(
      id,
      { status: "Active" },
      { new: true }
    );
    if (!newQuiz)
      throw new NotFoundException(
        "Quiz not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newQuiz;
  }

  async delete(
    id: string,
    user: UserDocument = {} as UserDocument
  ): Promise<Quiz> {
    const filter: any = { _id: id };
    if (user?.role === Role.Instructor) filter.instructor = user?._id;
    const deletedQuiz = await this.quizModel.findOne(filter).exec();
    if (!deletedQuiz)
      throw new NotFoundException(
        "Quiz not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    await this.quizModel.findOneAndRemove(filter).exec();
    return deletedQuiz;
  }
}
