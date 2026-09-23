import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationConfig } from './config/notification.config';
import { NotificationConfigModule } from './config/notification-config.module';
import { EmailManager } from './email-manager/email.manager';

/*Модуль для работы с уведомлениями.*/
@Module({
  imports: [
    /*Используем динамический модуль, чтобы можно было использовать класс "NotificationConfig" для работы с переменными
    окружения.*/
    MailerModule.forRootAsync({
      imports: [NotificationConfigModule],
      inject: [NotificationConfig],
      useFactory: (notificationConfig: NotificationConfig) => ({
        /*Создаем транспортер - механизм для работы с почтой. В параметрах метода настраиваем создаваемый транспортер.*/
        transport: {
          /*Имя почтового сервиса.*/
          service: notificationConfig.EMAIL_SERVICE_NAME,
          /*Адрес почты, используемый для отправки писем, и пароль приложения из Google.*/
          auth: { user: notificationConfig.EMAIL, pass: notificationConfig.EMAIL_APP_PASS },
        },
        /*Настройка отправителя по умолчанию.*/
        defaults: { from: `${notificationConfig.APP_NAME_FOR_NOTIFICATION_MODULE} <${notificationConfig.EMAIL}>` },
      }),
    }),
  ],
  providers: [EmailManager],
  exports: [EmailManager],
})
export class NotificationModule {}
