import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

/*Конфигурационный модуль для работы с файлами ".env".*/
export const configModule = ConfigModule.forRoot({
  envFilePath: [
    process.env.ENV_FILE_PATH?.trim() || '',
    join(__dirname, 'env', `.env.${process.env.NODE_ENV}.local`),
    join(__dirname, 'env', `.env.${process.env.NODE_ENV}`),
    join(__dirname, 'env', `.env.production`),
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    `.env.production`,
  ].filter(Boolean),

  isGlobal: true,
});
