import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { configValidationUtils } from '../../../core/utils/config/config-validation.util';
import { Trim } from '../../../core/decorators/transformation/trim.transformation-decorator';

/*Конфигурация по работе с переменными окружения необходимыми для аутентификации и авторизации.*/
@Injectable()
export class AuthConfig {
  public constructor(private readonly configService: ConfigService<any, true>) {
    this.BASIC_AUTH_LOGIN = this.configService.get('BASIC_AUTH_LOGIN');
    this.BASIC_AUTH_PASSWORD = this.configService.get('BASIC_AUTH_PASSWORD');
    this.AT_SECRET = this.configService.get('AT_SECRET');
    this.AT_TIME_IN_SECONDS = `${this.configService.get('AT_TIME_IN_SECONDS')}s`;
    this.RT_SECRET = this.configService.get('RT_SECRET');
    this.RT_TIME_IN_SECONDS = `${this.configService.get('RT_TIME_IN_SECONDS')}s`;

    this.CONFIRMATION_REGISTRATION_CODE_EXPIRATION_TIME_IN_MINUTES = Number(
      this.configService.get('CONFIRMATION_REGISTRATION_CODE_EXPIRATION_TIME_IN_MINUTES')
    );

    this.CONFIRMATION_REGISTRATION_CODE_EXPIRATION_TIME_IN_DB_IN_SECONDS = Number(
      this.configService.get('CONFIRMATION_REGISTRATION_CODE_EXPIRATION_TIME_IN_DB_IN_SECONDS')
    );

    this.PASSWORD_RECOVERY_CODE_EXPIRATION_TIME_IN_MINUTES = Number(
      this.configService.get('PASSWORD_RECOVERY_CODE_EXPIRATION_TIME_IN_MINUTES')
    );

    this.PASSWORD_RECOVERY_CODE_EXPIRATION_TIME_IN_DB_IN_SECONDS = Number(
      this.configService.get('PASSWORD_RECOVERY_CODE_EXPIRATION_TIME_IN_DB_IN_SECONDS')
    );

    this.SESSION_EXPIRATION_TIME_IN_DB_IN_SECONDS = Number(
      this.configService.get('SESSION_EXPIRATION_TIME_IN_DB_IN_SECONDS')
    );

    configValidationUtils.validateConfig(this);
  }

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  BASIC_AUTH_LOGIN: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  BASIC_AUTH_PASSWORD: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  AT_SECRET: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  AT_TIME_IN_SECONDS: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  RT_SECRET: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  RT_TIME_IN_SECONDS: string;

  @IsNumber({}, { message: '$property must be a number' })
  CONFIRMATION_REGISTRATION_CODE_EXPIRATION_TIME_IN_MINUTES: number;

  @IsNumber({}, { message: '$property must be a number' })
  CONFIRMATION_REGISTRATION_CODE_EXPIRATION_TIME_IN_DB_IN_SECONDS: number;

  @IsNumber({}, { message: '$property must be a number' })
  PASSWORD_RECOVERY_CODE_EXPIRATION_TIME_IN_MINUTES: number;

  @IsNumber({}, { message: '$property must be a number' })
  PASSWORD_RECOVERY_CODE_EXPIRATION_TIME_IN_DB_IN_SECONDS: number;

  @IsNumber({}, { message: '$property must be a number' })
  SESSION_EXPIRATION_TIME_IN_DB_IN_SECONDS: number;
}
