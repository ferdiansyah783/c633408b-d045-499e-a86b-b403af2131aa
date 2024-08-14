import { Body, Controller, HttpStatus, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // signup /api/auth/signup
  @Public()
  @Post('/signup')
  async signup(@Body() signupDto: SignupDto) {
    return {
      data: await this.authService.signup(signupDto),
      statusCode: HttpStatus.OK,
      message: 'Register success',
    };
  }

  // signin /api/auth/signin
  @Public()
  @Post('/signin')
  async signin(@Body() signinDto: SigninDto) {
    return {
      data: await this.authService.signin(signinDto),
      statusCode: HttpStatus.OK,
      message: 'Login success',
    };
  }

  // signout /api/auth/signout
  @Post('/signout')
  async signout(@Req() req) {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    const accessToken = type === 'Bearer' ? token : undefined;

    await this.authService.signout(req.user.sessionId, accessToken);

    return {
      statusCode: HttpStatus.OK,
      message: 'Logout success',
    };
  }

  // refresh token /api/auth/refresh
  @Public()
  @Post('/refresh')
  async refreshToken(@Body() body: any) {
    return {
      data: await this.authService.refreshToken(body.refresh_token),
      statusCode: HttpStatus.OK,
      message: 'Refresh token success',
    };
  }

  async decodeToken(token: string) {
    return await this.authService.decodeToken(token);
  }
}
