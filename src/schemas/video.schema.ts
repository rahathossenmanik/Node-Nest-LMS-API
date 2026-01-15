import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "./user.schema";

export type VideoDocument = HydratedDocument<Video>;

@Schema({ timestamps: true, versionKey: false })
export class Video {
  @ApiProperty({ example: 1001, required: false })
  @Prop({ required: false })
  videoId: number;

  @ApiProperty({ example: "Video Title", required: true })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: "https://example.com/video.mp4" })
  @Prop({ required: true })
  url: string;

  @ApiProperty({ example: 600 })
  @Prop({ required: true })
  lengthInSeconds: number;

  @ApiProperty({ example: "John Doe" })
  @Prop({ required: false })
  lecturer: string;

  @ApiProperty({ example: "60b5b2c2e4a4f1b4a0b5f4a4", required: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  author: User;

  @ApiProperty({ example: "This video covers the basics of React Hooks." })
  @Prop({ required: false })
  description: string;

  @ApiProperty({ example: ["React", "Hooks", "JavaScript"] })
  @Prop({ type: [String], required: false })
  tags: string[];

  @ApiProperty({ example: 1000 })
  @Prop({ required: false })
  viewCount: number;

  @ApiProperty({ example: "https://via.placeholder.com/150", required: true })
  @Prop({ required: true })
  thumbnail: string;

  @ApiProperty({ example: "2024-08-12T12:00:00.000Z", required: true })
  @Prop({ required: true })
  publishedDate: Date;

  @ApiProperty({ example: "Active" })
  @Prop({ default: "Active" })
  status: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
