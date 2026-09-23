import { INestApplication } from '@nestjs/common';
import { CoreConfig } from '../core/config/core.config';
import { globalPrefixSetup } from './global-prefix.setup';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';

/*Функция для конфигурирования экземпляров приложения NestJS.*/
export function appSetup(app: INestApplication): void {
  /*Настраиваем pipes для приложения.*/
  pipesSetup(app);
  /*Устанавливаем глобальный префикс ко всем маршрутам приложения.*/
  globalPrefixSetup(app);
  /*Получаем экземпляр класса "CoreConfig".*/
  const coreConfig: CoreConfig = app.get<CoreConfig>(CoreConfig);
  /*Генерируем документацию Swagger.*/
  if (coreConfig.IS_SWAGGER_ENABLED) swaggerSetup(app);
}
