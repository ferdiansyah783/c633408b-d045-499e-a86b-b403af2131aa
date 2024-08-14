import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  sendMessageToClient(message: any) {
    this.server.emit('receiveMessage', message);
  }
}
