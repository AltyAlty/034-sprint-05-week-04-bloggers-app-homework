import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../modules/user/api/auth/decorators/guard/public.guard-decorator';
import { AuthConfig } from '../../../modules/user/config/auth.config';
import { DomainException, DomainExceptionCode } from '../../exceptions/domain/domain.exception';

/*Гард для basic авторизации.*/
@Injectable()
export class BasicAuthGuard implements CanActivate {
  public constructor(
    private readonly authConfig: AuthConfig,
    private readonly reflector: Reflector
  ) {}

  /*Реализуем метод "canActivate()" как этого требует интерфейс "CanActivate()".*/
  public canActivate(context: ExecutionContext): boolean {
    /*Получаем объект запроса.*/
    const request: Request = context.switchToHttp().getRequest<Request>();
    /*Получаем заголовок "Authorization" из запроса. Должно быть вида "Basic <base64-encoded-credentials>".*/
    const authHeader: string | undefined = request.headers.authorization;

    /*Проверяем помечен ли участвующий в запросе контроллер или его метод метаданными, позволяющими пропустить проверку
    авторизации. Метод "context.getClass()" возвращает ссылку на контроллер, а метод "context.getHandler()" - на метод
    этого контроллера.*/
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    /*Если участвующий в запросе контроллер или его метод помечен метаданными, позволяющими пропустить проверку
    авторизации, то прерываем работу гарда.*/
    if (isPublic) return true;

    /*Если заголовок "Authorization" не был найден, то сообщаем об отказе в авторизации клиенту.*/
    if (!authHeader)
      throw new DomainException({
        code: DomainExceptionCode.NoBasicAuthHeader,
        message: 'Basic authorization header not found',
        field: 'authorization',
      });

    /*Если тип авторизации не "Basic", то сообщаем об отказе в авторизации клиенту.*/
    if (!authHeader.startsWith('Basic '))
      throw new DomainException({
        code: DomainExceptionCode.InvalidBasicAuthType,
        message: 'Invalid basic authorization type',
        field: 'authorization',
      });

    /*Разбиваем строку по пробелу, получая токен.*/
    const token: string = authHeader.split(' ')[1];
    /*Расшифровываем токен из формата Base64 в обычную строку.*/
    const credentials: string = Buffer.from(token, 'base64').toString('utf-8');
    /*Разделяем расшифрованный токен на логин и пароль так, чтобы, например, вариант "admin:pass:123" был обработан
    корректно.*/
    const separatorIndex: number = credentials.indexOf(':');
    const username: string = credentials.substring(0, separatorIndex);
    const password: string = credentials.substring(separatorIndex + 1);

    /*Если логин или пароль не совпадают с заранее заданными значениями, то сообщаем об отказе в авторизации клиенту.*/
    if (username !== this.authConfig.BASIC_AUTH_LOGIN || password !== this.authConfig.BASIC_AUTH_PASSWORD)
      throw new DomainException({
        code: DomainExceptionCode.InvalidBasicAuthCredentials,
        message: 'Invalid basic authorization credentials',
        field: 'authorization',
      });

    return true;
  }
}
