import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { configValidationUtils } from '../utils/config/config-validation.util';
import { Trim } from '../decorators/transformation/trim.transformation-decorator';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

enum BooleanInput {
  TRUE_01 = 'true',
  TRUE_02 = '1',
  TRUE_03 = 'enabled',
  TRUE_04 = 'on',
  FALSE_01 = 'false',
  FALSE_02 = '0',
  FALSE_03 = 'disabled',
  FALSE_04 = 'off',
}

/*Конфигурация по работе с переменными окружения необходимыми для общей работы приложения.*/
@Injectable()
export class CoreConfig {
  public constructor(private readonly configService: ConfigService<any, true>) {
    this.NODE_ENV = this.configService.get('NODE_ENV');
    this.PORT = Number(this.configService.get('PORT'));
    this.MONGO_URI = this.configService.get('MONGO_URI');
    this.MONGO_URI_LOCAL = this.configService.get('MONGO_URI_LOCAL');
    this.POSTGRESQL_DB_TYPE = this.configService.get('POSTGRESQL_DB_TYPE');
    this.POSTGRESQL_DB_HOST = this.configService.get('POSTGRESQL_DB_HOST');
    this.POSTGRESQL_DB_PORT = Number(this.configService.get('POSTGRESQL_DB_PORT'));
    this.POSTGRESQL_DB_USERNAME = this.configService.get('POSTGRESQL_DB_USERNAME');
    this.POSTGRESQL_DB_PASSWORD = this.configService.get('POSTGRESQL_DB_PASSWORD');
    this.DB_NAME = this.configService.get('DB_NAME');
    this.TEST_DB_NAME = this.configService.get('TEST_DB_NAME');

    this.IS_SWAGGER_ENABLED = configValidationUtils.convertToBoolean(
      this.configService.get('IS_SWAGGER_ENABLED')
    ) as boolean;

    this.APP_NAME_FOR_SWAGGER = this.configService.get('APP_NAME_FOR_SWAGGER');
    this.REQUEST_RATE_LIMIT = Number(this.configService.get('REQUEST_RATE_LIMIT'));
    this.REQUEST_RATE_LIMIT_TTL = Number(this.configService.get('REQUEST_RATE_LIMIT_TTL'));
    configValidationUtils.validateConfig(this);
  }

  @IsEnum(Environments, {
    message: `$property must be: ${configValidationUtils.getEnumValues(Environments).join(', ')}`,
  })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  NODE_ENV: string;

  @IsNumber({}, { message: '$property must be a number' })
  PORT: number;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  MONGO_URI: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  MONGO_URI_LOCAL: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  POSTGRESQL_DB_TYPE: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  POSTGRESQL_DB_HOST: string;

  @IsNumber({}, { message: '$property must be a number' })
  POSTGRESQL_DB_PORT: number;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  POSTGRESQL_DB_USERNAME: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  POSTGRESQL_DB_PASSWORD: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  DB_NAME: string;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  TEST_DB_NAME: string;

  @IsBoolean({ message: `$property must be: ${configValidationUtils.getEnumValues(BooleanInput).join(', ')}` })
  IS_SWAGGER_ENABLED: boolean;

  @IsString({ message: '$property must be a string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Trim()
  APP_NAME_FOR_SWAGGER: string;

  @IsNumber({}, { message: '$property must be a number' })
  REQUEST_RATE_LIMIT: number;

  @IsNumber({}, { message: '$property must be a number' })
  REQUEST_RATE_LIMIT_TTL: number;
}
