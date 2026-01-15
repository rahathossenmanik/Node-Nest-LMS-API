import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "./user.schema";

@Schema()
export class Question {
  @ApiProperty({
    example: "What is the correct syntax to print a message in the console?",
    required: true,
  })
  @Prop({ required: true })
  question: string;

  @ApiProperty({
    example: [
      "console.log('message');",
      "print('message');",
      "echo('message');",
      "log('message');",
    ],
    required: true,
  })
  @Prop({ type: [String], required: true })
  options: string[];

  @ApiProperty({
    example: "console.log('message');",
    required: true,
  })
  @Prop({ required: true })
  answer: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ timestamps: true, versionKey: false })
export class Quiz {
  @ApiProperty({ example: 1001, required: false })
  @Prop({ required: false })
  quizId: number;

  @ApiProperty({ example: "Quiz Title", required: true })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: 10, required: true })
  @Prop({ required: true })
  numQuestions: number;

  @ApiProperty({ example: 15, required: true })
  @Prop({ required: true })
  timeLimit: number;

  @ApiProperty({ example: "Intermediate", required: true })
  @Prop({ required: true })
  level: string;

  @ApiProperty({ example: 70, required: true })
  @Prop({ required: true })
  passGrade: number;

  @ApiProperty({ example: [], required: true })
  @Prop({ type: [QuestionSchema], required: true })
  questions: Question[];

  @ApiProperty({ example: "https://via.placeholder.com/150", required: true })
  @Prop({ required: true })
  thumbnail: string;

  @ApiProperty({ example: "60b5b2c2e4a4f1b4a0b5f4a4", required: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  instructor: User;

  @ApiProperty({ example: "2024-08-12T12:00:00.000Z", required: true })
  @Prop({ required: true })
  date: Date;

  @ApiProperty({ example: "Active" })
  @Prop({ default: "Active" })
  status: string;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
