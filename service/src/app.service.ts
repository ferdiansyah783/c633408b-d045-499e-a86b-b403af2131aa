import { Injectable } from '@nestjs/common';
import { ChatGateway } from 'src/app.gateway';
import { ChatDto } from 'src/dto/chat.dto';

@Injectable()
export class AppService {
  constructor (
    private readonly chatGateway: ChatGateway
  ) {}

  handleSentMessage(chat: ChatDto) {
    console.log(`Recived a new message: ${chat.content}`)
    this.chatGateway.sendMessageToClient(chat)
  }

  getMessages() {
    // return this.chats
  }
}
