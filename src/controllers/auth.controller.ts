import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { AuthInput, AuthOutput, ForgotPasswordInput } from 'src/schemas/user.schema';
import { AuthService } from 'src/services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('authenticate')
  async authenticate(@Body() payload: AuthInput): Promise<AuthOutput | Error> {
    return this.authService.authenticate(payload);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signup(@Body() payload: AuthInput): Promise<AuthOutput | Error> {
    return this.authService.signup(payload);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() payload: ForgotPasswordInput): Promise<Error | { message: string }> {
    return this.authService.forgotPassword(payload);
  }
}
