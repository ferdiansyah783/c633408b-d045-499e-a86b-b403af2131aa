import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SigninDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import * as uuid from 'uuid';
import { hashPassword } from './hash_password';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    try {
      const isExistEmail = await this.prismaService.user.findFirst({
        where: {
          email: signupDto.email,
        },
      });

      if (isExistEmail) {
        throw new BadRequestException('Email already exist');
      }

      const salt = uuid.v4();
      const password = await hashPassword(signupDto.password, salt);

      const user = await this.prismaService.user.create({
        data: {
          name: signupDto.name,
          email: signupDto.email,
          password: password,
          salt: salt,
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async signin(signinDto: SigninDto) {
    const existUser = await this.prismaService.user.findFirst({
      where: {
        email: signinDto.email,
      },
    });

    if (!existUser) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          error: 'Invalid credentials',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const passwordHashed = await hashPassword(
      signinDto.password,
      existUser.salt,
    );

    if (passwordHashed !== existUser.password) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          error: 'Invalid credentials',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const session = await this.prismaService.session.create({
      data: {
        userId: existUser.id,
        refreshToken: uuid.v4(),
        status: 'active',
      },
    });

    const accessToken = await this.jwtService.signAsync(
      {
        sub: existUser.id,
        name: existUser.name,
        sessionId: session.id,
      },
      {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: '1h',
      },
    );

    return {
      access_token: accessToken,
      refresh_token: session.refreshToken,
    };
  }

  async signout(sessionId: string, token: string): Promise<void> {
    const existSession = await this.prismaService.session.findFirst({
      where: {
        id: sessionId,
      },
    });

    if (!existSession) {
      throw new UnauthorizedException();
    }

    await this.prismaService.session.update({
      where: {
        id: sessionId,
      },
      data: {
        status: 'inactive',
      },
    });

    await this.prismaService.invalidToken.create({
      data: {
        token: token,
      },
    });
  }

  async refreshToken(token: string) {
    const session = await this.prismaService.session.findFirst({
      where: {
        refreshToken: token,
        status: 'active',
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Invalid token',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: session.userId,
        name: session.user.name,
        sessionId: session.id,
      },
      {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: '7d',
      },
    );

    return {
      access_token: accessToken,
    };
  }

  async decodeToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      return payload;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
