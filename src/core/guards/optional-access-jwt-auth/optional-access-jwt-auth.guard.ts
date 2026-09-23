import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserAccessJwtAuthContextDTO } from '../access-jwt-auth/dto/user-access-jwt-auth-context.dto';

/*Гард для опциональной авторизации по Access JWT, используя библиотеку Passport.js.*/
@Injectable()
export class OptionalAccessJwtAuthGuard extends AuthGuard('access-jwt') {
  public handleRequest<TUser = UserAccessJwtAuthContextDTO>(error: any, user: TUser): TUser | null {
    /*Если происходит ошибка валидации токена или пользователь не найден, то возвращаем null, чтобы запрос мог
    продолжиться без авторизации и выброса исключений.*/
    if (error || !user) return null;
    return user;
  }
}
