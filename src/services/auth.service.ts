import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthInput, AuthOutput, ForgotPasswordInput, User, UserDocument } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from './mail.service';

const saltOrRounds = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private mailService: MailService
  ) { }

  async authenticate(payload: AuthInput): Promise<AuthOutput | Error> {
    const { email, password } = payload;
    const fullUser = await this.userModel.findOne({ email }).select('+password').exec();
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    const { password: hash, ...user } = fullUser.toJSON();
    const isMatch = await bcrypt.compare(password, hash);
    if (isMatch) {
      return {
        accessToken: await this.jwtService.signAsync({ ...user, sub: user._id }),
      };
    } else {
      throw new UnauthorizedException('Invalid password');
    }
  }

  async create(user: AuthInput): Promise<User> {
    const { email, password } = user;
    const userToCreate = { email, password, userId: 1001, name: "" };

    const { userId: lastUserId }: any =
      (await this.userModel
        .findOne()
        .sort({ userId: -1 })
        .select("userId")
        .exec()) || {};
    userToCreate.userId = (Number(lastUserId) || 1000) + 1;
    userToCreate.name = email?.split("@")[0];

    userToCreate.password = await bcrypt.hash(password, saltOrRounds);
    const createdUser = new this.userModel(userToCreate);
    return createdUser.save();
  }

  async signup(payload: AuthInput): Promise<AuthOutput | Error> {
    const { email } = payload;
    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      throw new UnauthorizedException('User already exists!');
    }
    const createdUser = await this.create(payload);
    if (createdUser) {
      return await this.authenticate(payload);
    } else throw new UnauthorizedException('Registration failed!');
  }

  async forgotPassword(payload: ForgotPasswordInput): Promise<Error | { message: string }> {
    try {
      const { email } = payload;
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new UnauthorizedException('User not found!');
      }
      // Generate temporary password and send to mail
      const tempPassword = Math.random().toString(36).slice(-8);
      const password = await bcrypt.hash(tempPassword, saltOrRounds);
      await this.userModel.updateOne({ email }, { password });
      const res = await this.mailService.sendMail({
        to: email,
        subject: 'Password Reset',
        text: `Your temporary password is ${tempPassword}`,
        html: `<p>Your temporary password is <strong>${tempPassword}</strong></p>`
      });
      if (res.messageId) {
        return {
          message: 'Temporary password sent to mail!'
        }
      }
      else throw new UnauthorizedException('Mail failed to send!');
    } catch (error) {
      return error.message;
    }
  }
}
