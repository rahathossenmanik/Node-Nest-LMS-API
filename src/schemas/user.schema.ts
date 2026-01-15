import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';


export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, versionKey: false })
export class User {
  @ApiProperty({ example: "Active", required: false })
  @Prop({ required: false, default: "Active" })
  userId: number;

  @ApiProperty({ example: "example@something.com", required: true })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ example: "Qwe123!@#", required: true })
  @Prop({ required: true, select: false })
  password: string;

  @ApiProperty({ example: "user", required: true })
  @Prop({ required: true, default: "user" })
  role: string;

  @ApiProperty({ example: "Manik Hosen", required: false })
  @Prop({ required: false, default: "User" })
  name: string;

  @ApiProperty({ example: "01700000000", required: false })
  @Prop({ required: false })
  phone: string;

  @ApiProperty({ example: false, required: false })
  @Prop({ required: false, default: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: false, required: false })
  @Prop({ required: false, default: false })
  isPhoneVerified: boolean;

  @ApiProperty({
    example: "https://www.example.com/profile.png",
    required: false,
  })
  @Prop({ required: false, default: "https://www.example.com/profile.png" })
  profileImage: string;

  @ApiProperty({ example: "Bangladesh", required: false })
  @Prop({ required: false, default: "Bangladesh" })
  country: string;

  @ApiProperty({ example: "1205", required: false })
  @Prop({ required: false })
  postalCode: string;

  @ApiProperty({ example: "Dhaka", required: false })
  @Prop({ required: false })
  division: string;

  @ApiProperty({ example: "Rajbari", required: false })
  @Prop({ required: false })
  district: string;

  @ApiProperty({ example: "Pangsha", required: false })
  @Prop({ required: false })
  upazila: string;

  @ApiProperty({ example: "Active", required: false })
  @Prop({ required: false, default: "Active" })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export class ReadOnlyUser extends OmitType(User, ['password']) { }

export class AuthInput {
  @ApiProperty({ example: "example@something.com", required: true })
  email: string;

  @ApiProperty({ example: "Qwe123!@#", required: true })
  password: string;
}

export class AuthOutput {
  @ApiProperty({ example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjYwYjUwYzIyZTRhNGYxYjRhMGI1ZjRhNCIsInVzZXJOYW1lIjoiUmFoYXQgSG9zc2VuIiwiZW1haWwiOiJyYWhhdGhvc3Nlbm1hbmlrQGdtYWlsLmNvbSIsInBob25lIjoiMDE3MDAwMDAwMCIsInJvbGUiOiJ1c2VyIiwiYmFsYW5jZSI6MCwiY291bnRyeSI6IkJhbmdsYWRlc2giLCJwcm9maWxlSW1hZ2UiOiJodHRwczovL3d3dy5leGFtcGxlLmNvbS9wcm9maWxlLnBuZyIsImNvdW50cnkiOiJCYW5nbGFkZXNoIiwicG9zdGFsQ29kZSI6IjEyMDUiLCJkaXN0cmljdCI6IkRha2EiLCJ1cGF6aWxhIjoiUmFqYmFyaSIsInVwYXppbGFJZCI6IjYwYjUwYzIyZTRhNGYxYjRhMGI1ZjRhNCIsIndvcmtTdGF0aW9uIjoiNjBiNWIyYzJlNGE0ZjFiNGEwYjVmNGE0Iiwic3RhdHVzIjoiQWN0aXZlIiwidHJhaW5FbWFpbCI6IjIwMjEtMDUtMjFUMDg6MzA6MjQuMjMwWiIsIl9pZCI6IjYwYjUwYzIyZTRhNGYxYjRhMGI1ZjRhNCIsIl9fdiI6MCw' })
  accessToken: string;
}

export class ForgotPasswordInput {
  @ApiProperty({ example: 'example@something.com', required: true })
  email: string;
}

export class ChangePasswordInput {
  @ApiProperty({ example: "example@something.com", required: true })
  email: string;

  @ApiProperty({ example: "123456", required: true })
  oldPassword: string;

  @ApiProperty({ example: "654321", required: true })
  newPassword: string;
}