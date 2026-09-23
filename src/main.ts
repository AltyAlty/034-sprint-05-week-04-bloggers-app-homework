import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { CoreConfig } from './core/config/core.config';
import { appSetup } from './setup/app.setup';

/*Функция для запуска приложения.*/
async function bootstrap(): Promise<void> {
  /*Создаем экземпляр приложения NestJS.*/
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  /*Получаем экземпляр класса "CoreConfig".*/
  const coreConfig: CoreConfig = app.get<CoreConfig>(CoreConfig);
  /*Подключаем middleware для работы с cookies.*/
  app.use(cookieParser());
  /*Просим NestJS доверять заголовкам от прокси, чтобы правильно определять реальный IP пользователя и протокол вместо
  того, чтобы видеть IP самого прокси-сервера. Теперь NestJS будет брать на себя всю работу с заголовком
  "x-forwarded-for", и доставать из него реальный IP клиента и записывает его напрямую в свойство "request.ip".*/
  app.set('trust proxy', true);
  /*Настраиваем экземпляр приложения NestJS.*/
  appSetup(app);
  /*Указываем порт для экземпляра приложения NestJS.*/
  const PORT: number = coreConfig.PORT;
  /*Запускаем экземпляр приложения NestJS.*/
  await app.listen(PORT, (): void => console.log(`Server started. PORT: ${PORT}. NODE_ENV: ${coreConfig.NODE_ENV}`));
}

/*Запускаем приложение.*/
bootstrap();
