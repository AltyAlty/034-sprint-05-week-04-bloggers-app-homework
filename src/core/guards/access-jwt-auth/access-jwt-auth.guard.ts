import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException, DomainExceptionCode } from '../../exceptions/domain/domain.exception';
import { UserAccessJwtAuthContextDTO } from './dto/user-access-jwt-auth-context.dto';

/*Гард для авторизации по Access JWT, используя библиотеку Passport.js.*/
@Injectable()
export class AccessJwtAuthGuard extends AuthGuard('access-jwt') {
  /*Метод "handleRequest()" вызывается автоматически при перехвате ошибки валидации выброшенной либо библиотекой
  Passport.js, либо методом "validate()" из стратегии, или после успешной работы метода "validate()" из стратегии,
  получив от него объект с данными пользователя.

  Первым параметром метод "handleRequest()" получает ошибку валидации JWT от библиотеки Passport.js, вторым
  параметром - результат работы метода "validate()", третьим параметром - дополнительную информацию от библиотеки
  Passport.js, например, причину, почему токен невалиден, четвертым параметром - экземпляр интерфейса "ExecutionContext"
  для доступа к объектам запроса и ответа, пятым параметром - HTTP-статус, если стратегия вернула таковой.
  Результат работы этого метода будет помещен в свойство "user" объекта запроса, то есть в объект "req.user".*/
  public handleRequest<TUser = UserAccessJwtAuthContextDTO>(error: any, user: TUser): TUser {
    if (error instanceof DomainException) throw error;

    if (error || !user) {
      throw new DomainException({
        code: DomainExceptionCode.InvalidAccessJwt,
        message: 'Invalid Access JWT',
        field: 'authorization',
      });
    }

    return user;
  }
}
