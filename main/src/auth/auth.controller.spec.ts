jest.setTimeout(30000)

import { HttpStatus, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, PrismaService, JwtService],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be able to login', async () => {
    return await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        name: "admin",
        email: 'admin@gmail.com',
        password: 'password',
      })
      .expect(201);
  });

  it('should not be able to login with wrong credentials', async () => {
    return await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        email: 'admin@gmail.com',
        password: 'badpassword',
      })
      .expect(401);
  });

  it('should not be able to register with existing email', async () => {
    return await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        name: 'admin',
        email: 'admin@gmail.com',
        password: 'password',
      })
      .expect(400);
  });

  it('should be able to register', async () => {
    const randomString = Array.from({ length: 10 }, () =>
      String.fromCharCode(Math.floor(Math.random() * 62) + 48),
    ).join('');

    return await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        name: `${randomString}`,
        email: `${randomString}@gmail.com`,
        password: 'password',
      })
      .expect(201);
  });

  it('should be able to refresh token', async () => {
    const token = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        email: 'admin@gmail.com',
        password: 'password',
      })
      .then((res) => res.body.data.refresh_token);

    return await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({
        refresh_token: token,
      })
      .expect(201);
  });

  it('should be able to logout', async () => {
    const token = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        email: 'admin@gmail.com',
        password: 'password',
      })
      .then((res) => res.body.data.access_token);

    const decodeToken = await controller.decodeToken(token);

    const mockRequest = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      user: {
        sessionId: decodeToken.sessionId,
      },
    };

    const result = await controller.signout(mockRequest);

    expect(result).toEqual({
      statusCode: HttpStatus.OK,
      message: 'Logout success',
    });
  });

  it('should not be able to logout with wrong token', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer dfasdfasfasfasdfasfd',
      },
      user: {
        sessionId: '66b9edf779bbb4893d1b5c1f',
      },
    };

    try {
      await controller.signout(mockRequest);
    } catch (error) {
      expect(error.message).toEqual('Unauthorized');
    }
  });

  afterAll(async () => {
    await app.close();
  });
});