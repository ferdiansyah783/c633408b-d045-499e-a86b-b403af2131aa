jest.setTimeout(30000)

import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

describe('ChatController', () => {
  let controller: ChatController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [ChatService],
      imports: [
        ClientsModule.register([
          {
            name: 'CHAT_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: 'chat-queue',
            },
          },
        ]),
        PrismaModule,
        AuthModule
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);app = module.createNestApplication();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('/POST send message unauthorize', async () => {
    return request(app.getHttpServer())
      .post('/api/chat')
      .send({
        reciver_id: '66b9edf779bbb4893d1b5c20',
        content: 'Hello World!',
      })
      .expect(401);
  });

  it('/POST send message authorize', async () => {
    const token = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        email: 'john@example.com',
        password: 'password',
      })
      .then((res) => res.body.data.access_token);

    return await request(app.getHttpServer())
      .post('/api/chat')
      .send({
        reciver_id: '66b9edf779bbb4893d1b5c20',
        content: 'Hello World!',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  })
});
