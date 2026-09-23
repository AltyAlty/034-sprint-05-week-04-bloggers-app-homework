import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import { configValidationUtils } from '../../../utils/config/config-validation.util';
import { Trim } from '../../../decorators/transformation/trim.transformation-decorator';

/*Конфигурация по работе с переменными окружения необходимыми для работы с уведомлениями.*/
@Injectable()
export class NotificationConfig {
  public constructor(private readonly configService: ConfigService<any, true>) {
    this.EMAIL_SERVICE_NAME = this.configService.get('EMAIL_SERVICE_NAME');
    this.APP_NAME_FOR_NOTIFICATION_MODULE = this.configService.get('APP_NAME_FOR_NOTIFICATION_MODULE');
    this.EMAIL = this.configService.get('EMAIL');
    this.EMAIL_APP_PASS = this.configService.get('EMAIL_APP_PASS');
    configValidationUtils.validateConfig(this);
  }

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  EMAIL_SERVICE_NAME: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  APP_NAME_FOR_NOTIFICATION_MODULE: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  EMAIL: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  EMAIL_APP_PASS: string;
}
