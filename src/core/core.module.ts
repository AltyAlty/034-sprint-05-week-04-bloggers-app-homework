import { Module } from '@nestjs/common';
import { Argon2Adapter } from './security/cryptography/argon2.adapter';
import { BcryptAdapter } from './security/cryptography/bcrypt.adapter';
import { CoreConfig } from './config/core.config';
import { NotificationModule } from './modules/notification/notification.module';

/*Переиспользуемый модуль, предоставляющий общий функционал для всего приложения.*/
@Module({
  imports: [NotificationModule],
  providers: [CoreConfig, Argon2Adapter, BcryptAdapter],
  exports: [CoreConfig, Argon2Adapter, BcryptAdapter, NotificationModule],
})
export class CoreModule {}
