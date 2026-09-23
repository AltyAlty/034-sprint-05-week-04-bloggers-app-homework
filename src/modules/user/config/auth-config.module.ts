import { Module } from '@nestjs/common';
import { AuthConfig } from './auth.config';

/*Вспомогательный модуль для раздачи переменных из класса "AuthConfig".*/
@Module({
  providers: [AuthConfig],
  exports: [AuthConfig],
})
export class AuthConfigModule {}
