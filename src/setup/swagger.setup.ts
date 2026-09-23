import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { CoreConfig } from '../core/config/core.config';
import { SETTINGS } from '../core/settings/settings';
import { SwaggerSortEnums } from '../core/swagger/types/swagger-sort-enums';

/*Интерфейс для типизации контроллеров в Swagger UI.*/
interface SwaggerController {
  get(key: 'name'): string;
}

/*Интерфейс для списка тегов библиотеки Immutable.js в Swagger UI.*/
interface SwaggerTagsList {
  get(index: number): string;
}

/*Интерфейс для типизации методов в Swagger UI.*/
interface SwaggerMethod {
  get(key: 'method' | 'path'): string;
  get(key: 'tags'): SwaggerTagsList | undefined;
}

/*Функция для генерации документации Swagger.*/
export function swaggerSetup(app: INestApplication): void {
  /*Получаем экземпляр класса "CoreConfig".*/
  const coreConfig: CoreConfig = app.get<CoreConfig>(CoreConfig);

  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle(coreConfig.APP_NAME_FOR_SWAGGER)
    .addBasicAuth({ type: 'http', description: `Requires administrator's credentials`, scheme: 'basic' }, 'basic')
    .addBearerAuth(
      { type: 'http', description: 'Requires Access JWT without "Bearer "', bearerFormat: 'JWT', scheme: 'bearer' },
      'bearer'
    )
    .addCookieAuth(
      'refreshToken',
      { type: 'apiKey', description: 'Requires Refresh JWT', in: 'cookies', name: 'refreshToken' },
      'refreshToken'
    )
    .setVersion('0.1')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config, { extraModels: [SwaggerSortEnums] });

  SwaggerModule.setup(SETTINGS.GLOBAL_PREFIX, app, document, {
    customSiteTitle: coreConfig.APP_NAME_FOR_SWAGGER,

    /*В 12-й версии @nestjs/swagger был баг, когда значки блокнотов изначально были видны. Этот CSS-код их скрывает.*/
    customCss: `
    .opblock-summary .copy-to-clipboard {
      opacity: 0 !important;
      visibility: hidden !important;
      transition: opacity 0.15s ease-in-out;
    }
    .opblock-summary:hover .copy-to-clipboard {
      opacity: 1 !important;
      visibility: visible !important;
    }
  `,

    swaggerOptions: {
      /*Указываем, чтобы контроллеры сортировались в кастомном порядке в документации Swagger. Для этого настраиваем
      функцию-компаратор. Swagger UI передает в нее два контроллера для сравнения, чтобы определить, какой из них
      выставить выше в списке. Если функция возвращает отрицательное число, то "controllerA" идет раньше "controllerB".
      Если положительное, то "controllerB" идет раньше "controllerA". Если 0, то порядок не меняется.*/
      tagsSorter: (controllerA: SwaggerController | string, controllerB: SwaggerController | string): number => {
        /*Указываем желаемый порядок отображения контроллеров.*/
        const order: string[] = ['App', 'Auth', 'Security Devices', 'Users', 'Blogs', 'Posts', 'Comments', 'Testing'];
        /*Получаем имена контроллеров.*/
        const controllerNameA: string = typeof controllerA === 'string' ? controllerA : controllerA.get('name');
        const controllerNameB: string = typeof controllerB === 'string' ? controllerB : controllerB.get('name');
        /*Находим индекс каждого контроллера в массиве "order".*/
        const controllerIndexA: number = order.indexOf(controllerNameA);
        const controllerIndexB: number = order.indexOf(controllerNameB);

        /*Сортируем порядок отображения контроллеров. Тернарное условие "(index === -1 ? 99 : index)" защищает от
        контроллеров, не указанных в массиве "order" - они отправляются в конец списка.*/
        if (controllerIndexA !== controllerIndexB)
          return (controllerIndexA === -1 ? 99 : controllerIndexA) - (controllerIndexB === -1 ? 99 : controllerIndexB);

        /*Если контроллеры имеют одинаковый индекс или оба не найдены в списке, то сортируем их по алфавиту при помощи
        метода "localeCompare()".*/
        return controllerNameA.localeCompare(controllerNameB);
      },
      /*Указываем, чтобы методы контроллеров сортировались по типу в документации Swagger. Для этого настраиваем
      функцию-компаратор. Swagger UI передает в нее две метода контроллера для сравнения, чтобы определить, какой из них
      выставить выше в списке. Если функция возвращает отрицательное число, то "methodA" идет раньше "methodB". Если
      положительное, то "methodB" идет раньше "methodA". Если 0, то порядок не меняется.*/
      operationsSorter: (methodA: SwaggerMethod, methodB: SwaggerMethod): number => {
        /*Кастомный порядок сортировки методов для контроллера "AuthController".*/
        const authControllerOrder: string[] = [
          'POST /api/auth/registration',
          'POST /api/auth/registration-email-resending',
          'POST /api/auth/registration-confirmation',
          'POST /api/auth/password-recovery',
          'POST /api/auth/new-password',
          'POST /api/auth/login',
          'POST /api/auth/refresh-token',
          'POST /api/auth/logout',
          'GET /api/auth/me',
        ];

        /*Формируем ключи для сравнения методов контроллера "AuthController", например, "GET /api/auth/me".*/
        const keyA: string = `${methodA.get('method').toUpperCase()} ${methodA.get('path')}`;
        const keyB: string = `${methodB.get('method').toUpperCase()} ${methodB.get('path')}`;
        /*Находим индекс каждого метода контроллера "AuthController" в массиве "authControllerOrder".*/
        const indexA: number = authControllerOrder.indexOf(keyA);
        const indexB: number = authControllerOrder.indexOf(keyB);
        /*Если оба сравниваемых метода контроллера "AuthController" находятся в массиве "authControllerOrder", то
        возвращаем разницу их индексов, благодаря чему метод с меньшим индексом встанет выше в списке.*/
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        /*Если только первый метод находится в массиве "authControllerOrder", то возвращаем -1, чтобы поднять этот
        метод выше второго метода.*/
        if (indexA !== -1) return -1;
        /*Если только второй метод находится в массиве "authControllerOrder", то возвращаем 1, чтобы поднять этот
        метод выше первого метода.*/
        if (indexB !== -1) return 1;
        /*Указываем желаемый порядок отображения методов остальных контроллеров.*/
        const defaultOrder: string[] = ['post', 'get', 'put', 'patch', 'delete'];
        /*Получаем имена HTTP-методов у методов контроллера и приводим их к нижнему регистру.*/
        const methodNameA: string = methodA.get('method').toLowerCase();
        const methodNameB: string = methodB.get('method').toLowerCase();
        /*Находим индекс каждого метода контроллера в массиве "defaultOrder".*/
        const methodIndexA: number = defaultOrder.indexOf(methodNameA);
        const methodIndexB: number = defaultOrder.indexOf(methodNameB);

        /*Сортируем порядок отображения методов контроллера. Тернарное условие "(index === -1 ? 99 : index)" защищает
        от нераспространенных методов, например "HEAD" или "OPTIONS".*/
        if (methodIndexA !== methodIndexB)
          return (methodIndexA === -1 ? 99 : methodIndexA) - (methodIndexB === -1 ? 99 : methodIndexB);

        /*Если методы контроллера имеют одинаковый тип, то сортируем их по алфавиту путей при помощи метода
        "localeCompare()".*/
        return methodA.get('path').localeCompare(methodB.get('path'));
      },
    },
  });
}
