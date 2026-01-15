import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "./user.schema";

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ timestamps: true, versionKey: false })
export class Article {
  @ApiProperty({ example: 1001, required: false })
  @Prop({ required: false })
  articleId: number;

  @ApiProperty({ example: "Article Title", required: true })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: "Article Content", required: true })
  @Prop({ required: true })
  content: string;

  @ApiProperty({ example: "https://via.placeholder.com/150", required: true })
  @Prop({ required: true })
  thumbnail: string;

  @ApiProperty({ example: "60b5b2c2e4a4f1b4a0b5f4a4", required: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  author: User;

  @ApiProperty({ example: "2024-08-12T12:00:00.000Z", required: true })
  @Prop({ required: true })
  date: Date;

  @ApiProperty({ example: "Active" })
  @Prop({ default: "Active" })
  status: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
