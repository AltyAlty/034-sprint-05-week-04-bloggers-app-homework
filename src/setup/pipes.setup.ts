/*Импортируем "INestApplication" для типизации экземпляров приложения NestJS.*/
import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ErrorMessageType, ErrorsMessagesType } from '../core/validation/types/errors-messages.type';

/*Функция для настройки pipes в приложении.*/
export function pipesSetup(app: INestApplication): void {
  /*Регистрируем pipes глобально, то есть для всех контроллеров и всех запросов.*/
  app.useGlobalPipes(
    /*Pipe "ValidationPipe" - это встроенный в NestJS pipe, отвечающий за валидацию входящих данных.*/
    new ValidationPipe({
      /*Опция "transform: true" превращает сырые входные JavaScript-данные в экземпляр класса, который указан как input
      DTO в методах контроллера.

      В случае метода "getBlogList()" в контроллере "BlogsController" NestJS при помощи библиотеки class-transformer
      создаст экземпляр класса "GetBlogListQueryInputDTO", то есть примерно будет выполнено
      "new GetBlogListQueryInputDTO()". Таким образом в метод "getBlogList()" query-сервиса "blogsQueryService" можно
      будет передать параметр "query", который помимо свойств, еще будет иметь и полезные методы.

      Также эта опция нужна для работы декоратора "@Transform()" из библиотеки class-transformer.*/
      transform: true,
      /*Опция "exposeDefaultValues: true" заставляет библиотеку class-transformer принудительно подставлять значения по
      умолчанию из свойств класса Input DTO, например, "pageNumber: number = 1", если клиент не передал эти параметры в
      запросе.*/
      transformOptions: { exposeDefaultValues: true },
      /*Опция "whitelist: true" удаляет из запроса поля, которых нет в Input DTO.*/
      whitelist: true,
      /*Опция "stopAtFirstError: true" останавливает валидацию поля после первой ошибки.*/
      stopAtFirstError: true,
      /*Опция "exceptionFactory" указывает на функцию, которая перехватывает процесс создания ошибки валидации
      библиотекой class-validator и может:
      1. Изменить структуру ответа.
      2. Изменить статус-код.
      3. Логировать ошибки валидации перед тем, как отправить их клиенту.*/
      exceptionFactory: (errors: ValidationError[]): never => {
        /*Перебираем ошибки валидации.*/
        const errorsForResponse: ErrorsMessagesType = errors.map((error: ValidationError): ErrorMessageType => {
          /*Так как включена опция "stopAtFirstError: true", то для каждого поля будет только одна ошибка. Внутри
          свойства "constraints" объекта с ошибкой валидации лежат пары "Название декоратора: Текст ошибки", но в данном
          случае будет только одна такая пара.*/
          const constraints: Record<string, string> = error.constraints || {};
          /*Получаем имя декоратора валидации, в котором была ошибка.*/
          const validationDecoratorName: string = Object.keys(constraints)[0];
          /*Формируем объект ошибки в формате "ErrorMessageType". Свойство "error.property" содержит название поля, на
          котором произошла ошибка валидации.*/
          return { field: error.property, message: constraints[validationDecoratorName] };
        });

        /*Выбрасываем исключение для перехвата NestJS, который в свою очередь отправит клиенту ответ со статусом 400 и
        объектом с ошибками валидации.*/
        throw new BadRequestException({ errorsMessages: errorsForResponse });
      },
    })
  );
}
