import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../../modules/user/application/auth/auth.service';
import { DomainException, DomainExceptionCode } from '../../exceptions/domain/domain.exception';
import { UserLocalAuthContextDTO } from './dto/user-local-auth-context.dto';

/*Стратегия для аутентификации по логину или email и паролю, используя библиотеку Passport.js.*/
@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly authService: AuthService) {
    /*Указываем, чтобы библиотека Passport.js отслеживала поля "loginOrEmail" и "password" в объекте запроса. По
    умолчанию отслеживаются поля "username" и "password".*/
    super({ usernameField: 'loginOrEmail', passwordField: 'password' });
  }

  /*Реализовываем метод "validate()", требуемый библиотекой Passport.js. Этот метод в данном случае принимает то, что
  находилось в свойствах "usernameField" и "passwordField".*/
  public async validate(loginOrEmail: string, password: string): Promise<UserLocalAuthContextDTO> {
    /*Просим сервис "AuthService" валидировать учетные данные пользователя при аутентификации по логину или email и
    паролю.*/
    const user: UserLocalAuthContextDTO | null = await this.authService.validateUserLocalAuthCredentials({
      loginOrEmail,
      password,
    });

    /*Если учетные данные пользователя при аутентификации по логину или email не были валидированы, то выбрасываем
    исключение "DomainException" с информацией об этом.*/
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.InvalidLocalAuthCredentials,
        message: 'Invalid local authorization credentials or the user registration is not confirmed',
        field: 'loginOrEmail/password',
      });
    }

    /*Если учетные данные пользователя при аутентификации по логину или email были валидированы, то указываем данные о
    нем в объекте запроса и разрешаем дальнейшее выполнение запроса.*/
    return user;
  }
}
