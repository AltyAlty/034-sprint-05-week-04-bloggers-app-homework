import { INestApplication, RequestMethod } from '@nestjs/common';
import { SETTINGS } from '../core/settings/settings';

/*Функция для установки глобального префикса ко всем маршрутам приложения.*/
export function globalPrefixSetup(app: INestApplication): void {
  /*Вторым параметром исключаем указание глобального префикса для GET-метода в контроллере "AppController".*/
  app.setGlobalPrefix(SETTINGS.GLOBAL_PREFIX, { exclude: [{ path: '/', method: RequestMethod.GET }] });
}
