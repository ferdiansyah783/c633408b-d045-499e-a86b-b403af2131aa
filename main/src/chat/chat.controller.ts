import { Body, Controller, Get, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Send message /api/chat
  @Post()
  async sendMessage(@Body() createChatDto: CreateChatDto, @Req() req) {
    return {
      data: await this.chatService.sendMessage(createChatDto, req.user.sub),
      statusCode: HttpStatus.OK,
      message: 'Register success',
    };
  }

  @Get()
  getMessages() {
    return this.chatService.getMessages();
  }

  // Get conversation between two users /api/chat/:userId1/:userId2
  @Get(':userId1/:userId2')
  async getConversation(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ) {
    return this.chatService.getConversationBetweenUsers(
      userId1,
      userId2,
    );
  }
}
