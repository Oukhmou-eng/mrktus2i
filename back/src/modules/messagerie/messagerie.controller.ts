import { Body, Controller, Get, Inject, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MessagerieService } from './messagerie.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagerieGateway } from './messagerie.gateway';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagerieController {
  constructor(
    private readonly messagerieService: MessagerieService,
    private readonly messagerieGateway: MessagerieGateway,
  ) {}

  @Get('conversations')
  async getConversations(@Request() req) {
    const user = req.user;
    return this.messagerieService.getConversations(user.id_user, user.id_boutique ?? null);
  }

  @Get('conversations/:id')
  async getConversationMessages(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.messagerieService.getMessages(+id, user.id_user, user.id_boutique ?? null);
  }

  @Post('conversations/:id/lu')
  async markConversationAsRead(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.messagerieService.markConversationAsRead(+id, user.id_user, user.id_boutique ?? null);
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateMessageDto) {
    const user = req.user;
    const message = await this.messagerieService.createMessage(
      user.id_user,
      dto,
      user.id_boutique ?? null,
    );

    try {
      const roomName = `conversation_${message.id_conversation}`;
      this.messagerieGateway.server.to(roomName).emit('newMessage', message);
    } catch (err) {
      console.warn('Failed to emit newMessage via gateway:', err?.message || err);
    }

    return message;
  }
}
