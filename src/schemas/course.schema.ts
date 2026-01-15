import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "./user.schema";
import { CONTENT_TYPE } from "src/constants/enums/contentType.enum";

@Schema()
export class Module {
  @ApiProperty({
    example: "60c72b2f9b1e8c5a5b8e7b3c",
    description: "Reference to an Article, Quiz, or Video",
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    refPath: "courseIndex.0.contentType",
    required: true,
  })
  contentId: mongoose.Schema.Types.ObjectId;

  @ApiProperty({
    example: "video",
    description: "Type of content, can be Article, Quiz, or Video",
  })
  @Prop({ required: true })
  contentType: CONTENT_TYPE;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true, versionKey: false })
export class Course {
  @ApiProperty({ example: 1001, required: false })
  @Prop({ required: false })
  courseId: number;

  @ApiProperty({ example: "Course Title", required: true })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: 10 })
  @Prop({ required: true, default: 0 })
  numArticles: number;

  @ApiProperty({ example: 5 })
  @Prop({ required: true, default: 0 })
  numVideos: number;

  @ApiProperty({ example: 3 })
  @Prop({ required: true, default: 0 })
  numQuizzes: number;

  @ApiProperty({ example: "60b5b2c2e4a4f1b4a0b5f4a4", required: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  instructor: User;

  @ApiProperty({ example: 1500 })
  @Prop({ required: false, default: 0 })
  numStudents: number;

  @ApiProperty({ example: "Intermediate", required: true })
  @Prop({ required: true })
  level: string;

  @ApiProperty({ example: "10 weeks" })
  @Prop({ required: true })
  timeline: number;

  @ApiProperty({ type: [[Module]] })
  @Prop({ type: [[ModuleSchema]], required: true })
  courseIndex: Module[][];

  @ApiProperty({ example: "https://via.placeholder.com/150", required: true })
  @Prop({ required: true })
  thumbnail: string;

  @ApiProperty({ example: "2024-08-12T12:00:00.000Z", required: true })
  @Prop({ required: true })
  date: Date;

  @ApiProperty({ example: "Active" })
  @Prop({ default: "Active" })
  status: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
