import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose, { HydratedDocument } from "mongoose";

export type FileDocument = HydratedDocument<File>;

@Schema({ timestamps: true, versionKey: false })
export class File {
  @ApiProperty({ example: "sample_image.jpg", required: true })
  @Prop({ type: String, required: true })
  public_id: string;

  @ApiProperty({
    example:
      "https://res.cloudinary.com/demo/image/upload/v1623654395/sample.jpg",
    required: true,
  })
  @Prop({ type: String, required: true })
  url: string;

  @ApiProperty({
    example:
      "https://res.cloudinary.com/demo/image/upload/v1623654395/sample.jpg",
    required: true,
  })
  @Prop({ type: String, required: true })
  secure_url: string;

  @ApiProperty({ example: "image", required: true })
  @Prop({ type: String, required: true })
  resource_type: string;

  @ApiProperty({ example: "upload", required: true })
  @Prop({ type: String, required: true })
  type: string;

  @ApiProperty({ example: "jpg", required: true })
  @Prop({ type: String, required: true })
  format: string;

  @ApiProperty({ example: "v1623654395", required: true })
  @Prop({ type: String, required: true })
  version: string;

  @ApiProperty({ example: 500, required: true })
  @Prop({ type: Number, required: true })
  width: number;

  @ApiProperty({ example: 600, required: true })
  @Prop({ type: Number, required: true })
  height: number;

  @ApiProperty({ example: 34567, required: true })
  @Prop({ type: Number, required: true })
  bytes: number;

  @ApiProperty({ example: "image/jpeg", required: false })
  @Prop({ type: String })
  mime_type: string;

  @ApiProperty({ example: "34567.jpg", required: false })
  @Prop({ type: String })
  original_filename?: string;

  @ApiProperty({ example: "{}", required: false })
  @Prop({ type: mongoose.Schema.Types.Mixed })
  error: any;

  @ApiProperty({ example: "v1/folder/sample_image", required: false })
  @Prop({ type: String })
  folder?: string;

  @ApiProperty({ example: "auto", required: false })
  @Prop({ type: String })
  quality?: string;

  @ApiProperty({ example: "tags", required: false })
  @Prop({ type: [String] })
  tags?: string[];
}

export const FileSchema = SchemaFactory.createForClass(File);

export class FileInput {
  @ApiProperty({
    example:
      "https://res.cloudinary.com/demo/image/upload/v1623654395/sample.jpg",
    required: true,
  })
  url: string;

  @ApiProperty({ example: "sample", required: true })
  title: string;
}
