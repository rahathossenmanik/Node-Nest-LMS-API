import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "./user.schema";

@Schema()
export class Progress {
  @ApiProperty({ required: true })
  @Prop({ required: true })
  weekNo: number;

  @ApiProperty({ required: true })
  @Prop({ required: true })
  moduleNo: number;

  @ApiProperty({ required: true })
  @Prop({ required: true, default: false })
  isCompleted: boolean;
}
export const ProgressSchema = SchemaFactory.createForClass(Progress);

export type CourseHistoryDocument = HydratedDocument<CourseHistory>;

@Schema({ timestamps: true, versionKey: false })
export class CourseHistory {
  @ApiProperty({ example: 1001, required: true })
  @Prop({ required: true })
  courseId: number;

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
  isEnrolled: boolean;

  @ApiProperty({ example: "2024-08-12T12:00:00.000Z", required: false })
  @Prop({ required: false })
  enrollDate: Date;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  isFinished: boolean;

  @ApiProperty({ example: "2024-08-12T12:00:00.000Z", required: false })
  @Prop({ required: false })
  finishDate: Date;

  @ApiProperty({ type: [Progress], example: [] })
  @Prop({ type: [ProgressSchema], default: [] })
  progress: Progress[];

  @ApiProperty({ example: "Active" })
  @Prop({ default: "Active" })
  status: string;
}

export const CourseHistorySchema = SchemaFactory.createForClass(CourseHistory);

export interface ICourseCompleteResponse {
  isPassed: boolean;
  score: number;
  passGrade: number;
  totalQuestions: number;
  correctAnswers: number;
  userAnswers: {
    question: string;
    answer: string | number;
  }[];
  questions: any[];
}

export interface Progress {
  weekNo: number;
  moduleNo: number;
  isCompleted: boolean;
}
