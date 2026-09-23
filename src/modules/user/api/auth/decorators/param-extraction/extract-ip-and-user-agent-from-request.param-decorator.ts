import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserAgentAndIpDTO } from './dto/user-agent-and-ip.dto';

/*Декоратор для получения из объекта запроса значения заголовка "user-agent" и IP-адреса пользователя.*/
export const ExtractIpAndUserAgentFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserAgentAndIpDTO => {
    /*Получаем объект запроса.*/
    const request: Request = context.switchToHttp().getRequest<Request>();
    /*Получаем значение заголовка "user-agent".*/
    const userAgent: string = request.headers['user-agent']!;
    /*Получаем IP пользователя.*/
    const ip: string = request.ip!;
    /*Возвращаем значение заголовка "user-agent" и IP-адреса пользователя*/
    return { ip, userAgent };
  }
);
