require('dotenv').config({ path: '.env' });
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from 'src/controllers/auth.controller';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { UserSchema } from 'src/schemas/user.schema';
import { AuthService } from 'src/services/auth.service';
import { MailService } from 'src/services/mail.service';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema }
        ])
    ],
    controllers: [AuthController],
    providers: [MailService, AuthService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AuthModule { }
