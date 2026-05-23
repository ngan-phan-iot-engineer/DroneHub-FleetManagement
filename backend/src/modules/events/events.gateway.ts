import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Trong môi trường production, hãy thay thế bằng origin cố định
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway đã khởi tạo');
  }

  handleConnection(client: Socket) {
    console.log(`Client vừa kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client đã ngắt kết nối: ${client.id}`);
  }

  // Ví dụ về một event listener
  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any): string {
    console.log('Nhận được thông điệp ping từ client:', data);
    this.server.emit('pong', 'Chào bạn từ Server NestJS thông qua Socket.IO!');
    return 'pong';
  }
}
