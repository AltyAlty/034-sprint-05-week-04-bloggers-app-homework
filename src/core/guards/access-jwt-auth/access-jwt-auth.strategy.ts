import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPostgresqlService } from '../../../modules/user/application/auth/auth-postgresql.service';
import { UserPostgresqlDb } from '../../../modules/user/infrastructure/users/postgresql-types/user-postgresql-db.type';
import { AuthConfig } from '../../../modules/user/config/auth.config';
import { DomainException, DomainExceptionCode } from '../../exceptions/domain/domain.exception';
import { AccessJwtPayloadDTO } from './dto/access-jwt-payload.dto';
import { UserAccessJwtAuthContextDTO } from './dto/user-access-jwt-auth-context.dto';

/*Стратегия для авторизации по Access JWT, используя библиотеку Passport.js.*/
@Injectable()
export class AccessJwtAuthStrategy extends PassportStrategy(Strategy, 'access-jwt') {
  public constructor(
    public readonly authConfig: AuthConfig,
    private readonly authService: AuthPostgresqlService
  ) {
    /*Настраиваем как библиотеке Passport.js работать с Access JWT.*/
    super({
      /*Указываем искать токен в заголовке "Authorization" в формате "Bearer token".*/
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      /*Указываем не игнорировать проверку срока годности токена.*/
      ignoreExpiration: false,
      /*Указываем секрет.*/
      secretOrKey: authConfig.AT_SECRET,
    });
  }

  /*Реализовываем метод "validate()", требуемый библиотекой Passport.js. Этот метод в данном случае принимает
  декодированный payload из Access JWT.*/
  public async validate(payload: AccessJwtPayloadDTO): Promise<UserAccessJwtAuthContextDTO> {
    /*Просим сервис "AuthService" валидировать payload из Access JWT.*/
    const user: UserPostgresqlDb | null = await this.authService.validateAccessJwtPayload(payload);

    /*Если payload из Access JWT не был валидирован, то выбрасываем исключение "DomainException" с информацией об
    этом.*/
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.InvalidAccessJwtPayload,
        message: 'Invalid Access JWT payload',
        field: 'authorization',
      });
    }

    /*Если payload из Access JWT был валидирован, то возвращаем ID и логин пользователя.*/
    return { id: payload.userId, login: user.login };
  }
}
