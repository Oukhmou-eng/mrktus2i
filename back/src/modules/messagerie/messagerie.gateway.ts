import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagerieService } from './messagerie.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class MessagerieGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messagerieService: MessagerieService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET ?? 'default_jwt_secret',
      });
      client.data.user = payload;
    } catch (error) {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    client.data.user = null;
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    const user = client.data.user;
    if (!user) {
      return { success: false, message: 'Non autorisé.' };
    }

    const conversationId = Number(data?.conversationId);
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return { success: false, message: 'Identifiant de conversation invalide.' };
    }

    try {
      await this.messagerieService.validateConversationAccess(
        conversationId,
        user.id_user,
        user.id_boutique ?? null,
      );
      client.join(`conversation_${conversationId}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error?.message || 'Impossible de rejoindre la conversation.' };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      id_conversation?: number;
      id_boutique?: number;
      contenu: string;
      type_message?: string;
      id_produit?: number;
    },
  ) {
    const user = client.data.user;
    if (!user) {
      return { success: false, message: 'Non autorisé.' };
    }

    try {
      const message = await this.messagerieService.createMessage(
        user.id_user,
        {
          id_conversation: payload.id_conversation,
          id_boutique: payload.id_boutique,
          contenu: payload.contenu,
          type_message: payload.type_message || 'texte',
          id_produit: payload.id_produit,
        },
        user.id_boutique ?? null,
      );

      const roomName = `conversation_${message.id_conversation}`;
      this.server.to(roomName).emit('newMessage', message);
      client.join(roomName);

      return { success: true, message };
    } catch (error) {
      return { success: false, message: error?.message || 'Impossible d\'envoyer le message.' };
    }
  }
}
