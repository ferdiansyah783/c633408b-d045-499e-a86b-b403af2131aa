import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('send-message')
  handleSentMessage(@Payload() chat) {
    return this.appService.handleSentMessage(chat);
  }

  @MessagePattern({ cmd: 'fetch-messages' })
  getMessages(@Ctx() context: RmqContext) {
    console.log(context.getMessage());
    return this.appService.getMessages();
  }
}
