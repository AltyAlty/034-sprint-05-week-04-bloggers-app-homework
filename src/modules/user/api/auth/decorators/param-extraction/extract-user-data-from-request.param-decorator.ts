import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/*Декоратор для получения из объекта запроса данных о пользователе.*/
export const ExtractUserDataFromRequest = createParamDecorator((data: unknown, context: ExecutionContext): unknown => {
  /*Получаем объект запроса.*/
  const request: Request = context.switchToHttp().getRequest<Request>();
  /*Получаем данные о пользователе и возвращаем их.*/
  return request.user;
});
