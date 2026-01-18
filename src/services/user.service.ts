import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import {
  AuthOutput,
  ChangePasswordInput,
  ReadOnlyUser,
  User,
  UserDocument,
} from "src/schemas/user.schema";
import { IPaginatedResult } from "src/interfaces/IPaginatedResult";
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

const saltOrRounds = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  async findAll(
    page: string,
    perPage: string,
    query: string
  ): Promise<IPaginatedResult<ReadOnlyUser>> {
    const filter: FilterQuery<User> = query
      ? {
          $or: [
            { name: new RegExp(query, "i") },
            { email: new RegExp(query, "i") },
          ],
        }
      : {};

    const data = await this.userModel
      .find(filter)
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .exec();
    const totalCount = await this.userModel.countDocuments(filter).exec();

    return { data, totalCount };
  }

  async findById(id: string): Promise<ReadOnlyUser> {
    return this.userModel.findById(id).exec();
  }

  async findByUserId(userId: number): Promise<User> {
    return this.userModel.findOne({ userId }).exec();
  }

  async create(user: User): Promise<User> {
    user.password = await bcrypt.hash(user.password, saltOrRounds);
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async update(
    user: User,
    userMeta: UserDocument = {} as UserDocument
  ): Promise<AuthOutput | Error> {
    const { _id: id } = userMeta;
    delete user?.password;
    delete user?.role;
    await this.userModel.findByIdAndUpdate(id, user);
    const newUser = await this.userModel.findById(id).lean().exec();
    return {
      accessToken: await this.jwtService.signAsync({ ...newUser, sub: id }),
    };
  }

  async changeUserRole(
    user: User,
    userMeta: UserDocument = {} as UserDocument
  ): Promise<User> {
    const { userId, role } = user;
    await this.userModel.findOneAndUpdate({ userId }, { role });
    return this.userModel.findOne({ userId }).exec();
  }

  async delete(id: string): Promise<User> {
    const deletedUser = await this.userModel.findById(id).exec();
    await this.userModel.findByIdAndRemove(id).exec();
    return deletedUser;
  }

  async changePassword(
    payload: ChangePasswordInput
  ): Promise<Error | { message: string }> {
    try {
      const { email, oldPassword, newPassword } = payload;
      const user = await this.userModel
        .findOne({ email })
        .select("+password")
        .exec();
      if (!user) {
        return new Error("User not found!");
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (isMatch) {
        const password = await bcrypt.hash(newPassword, saltOrRounds);
        await this.userModel.updateOne({ email }, { password });
        return { message: "Password changed successfully!" };
      } else {
        return new Error("Invalid password!");
      }
    } catch (error) {
      return error.message;
    }
  }
}
