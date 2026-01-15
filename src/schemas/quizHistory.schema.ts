import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "./user.schema";
import { Question } from "./quiz.schema";

@Schema()
export class Answer {
  @ApiProperty({ required: true })
  @Prop({ required: true })
  question: string;

  @ApiProperty({ required: true })
  @Prop({ required: true })
  answer: string;
}
export const AnswerSchema = SchemaFactory.createForClass(Answer);

export type QuizHistoryDocument = HydratedDocument<QuizHistory>;

@Schema({ timestamps: true, versionKey: false })
export class QuizHistory {
  @ApiProperty({ example: 1001, required: true })
  @Prop({ required: true })
  quizId: number;

  @ApiProperty({ example: "60b5b2c2e4a4f1b4a0b5f4a4", required: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userId: User;

  @ApiProperty({ example: true })
  @Prop({ default: true })
  isEligible: boolean;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  isBlocked: boolean;

  @ApiProperty({ example: "2024-08-12T12:00:00.000Z", required: false })
  @Prop({ required: false })
  unblockDate: Date;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  isStarted: boolean;

  @ApiProperty({ example: "2024-08-12T12:00:00.000Z", required: false })
  @Prop({ required: false })
  startDate: Date;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  isFinished: boolean;

  @ApiProperty({ example: "2024-08-12T12:00:00.000Z", required: false })
  @Prop({ required: false })
  finishDate: Date;

  @ApiProperty({ example: 0 })
  @Prop({ default: 0 })
  score: number;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  isPassed: boolean;

  @ApiProperty({ type: [Answer], example: [] })
  @Prop({ type: [AnswerSchema], default: [] })
  answers: Answer[];

  @ApiProperty({ example: "Active" })
  @Prop({ default: "Active" })
  status: string;
}

export const QuizHistorySchema = SchemaFactory.createForClass(QuizHistory);

export interface IQuizCompleteResponse {
  isPassed: boolean;
  score: number;
  passGrade: number;
  totalQuestions: number;
  correctAnswers: number;
  userAnswers: {
    question: string;
    answer: string | number;
  }[];
  questions: Question[];
}

export interface IQuizCompletionCheckResponse {
  isFinished: boolean;
  isStarted?: boolean;
  quizHistory: IQuizCompleteResponse | null;
}
