import { Module } from '@nestjs/common';
import { NotificationConfig } from './notification.config';

/*Вспомогательный модуль для раздачи переменных из класса "NotificationConfig".*/
@Module({
  providers: [NotificationConfig],
  exports: [NotificationConfig],
})
export class NotificationConfigModule {}
