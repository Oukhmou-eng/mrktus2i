import { Controller, Get, Post, Body, Param, Patch, Delete,UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @Patch('user/read-all')
  markAllAsRead(@CurrentUser() user: { id_user: number }) {
    return this.notificationsService.markAllAsRead(user.id_user);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getNotifications(@CurrentUser() user: { id_user: number }) {
    return this.notificationsService.getNotifications(user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @CurrentUser() user: { id_user: number },
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(user.id_user, +id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
