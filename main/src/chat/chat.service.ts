import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';
import { CreateChatDto } from 'src/chat/dto/create-chat.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject('CHAT_SERVICE') private readonly rabbitClient: ClientProxy,
    private readonly prisma: PrismaService,
  ) {}

  async createConversation(userIds: string[]) {
    return await this.prisma.conversation.create({
      data: {
        users: {
          create: userIds.map((userId) => ({
            user: { connect: { id: userId } },
          })),
        },
      },
      include: { users: true },
    });
  }

  async findOrCreateConversation(userIds: string[]): Promise<any> {
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: userIds.map((userId) => ({
          users: {
            some: {
              userId,
            },
          },
        })),
      },
      include: { users: true },
    });

    if (!conversation) {
      conversation = await this.createConversation(userIds);
    }

    return conversation;
  }

  async sendMessage(createChatDto: CreateChatDto, senderId: string) {
    const { content, reciver_id } = createChatDto;
    const conversation = await this.findOrCreateConversation([
      senderId,
      reciver_id,
    ]);

    const chat = await this.prisma.chat.create({
      data: {
        content,
        sender: { connect: { id: senderId } },
        conversation: { connect: { id: conversation.id } },
      },
    });

    this.rabbitClient.emit('send-message', chat);

    return chat;
  }

  async getMessages() {
    return this.rabbitClient
      .send(
        {
          cmd: 'fetch-messages',
        },
        {},
      )
      .pipe(timeout(5000));
  }

  async getConversationBetweenUsers(userId1: string, userId2: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { users: { some: { userId: userId1 } } },
          { users: { some: { userId: userId2 } } },
        ],
      },
      include: {
        chats: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error('No conversation found between the users.');
    }

    return conversation;
  }
}
