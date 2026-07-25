import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MessagerieService } from './messagerie.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagerieController {
  constructor(private readonly messagerieService: MessagerieService) {}

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
    return this.messagerieService.createMessage(user.id_user, dto, user.id_boutique ?? null);
  }
}
