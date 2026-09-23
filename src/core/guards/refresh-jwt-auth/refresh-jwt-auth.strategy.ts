import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPostgresqlService } from '../../../modules/user/application/auth/auth-postgresql.service';
import { UserPostgresqlDb } from '../../../modules/user/infrastructure/users/postgresql-types/user-postgresql-db.type';
import { AuthConfig } from '../../../modules/user/config/auth.config';
import { DomainException, DomainExceptionCode } from '../../exceptions/domain/domain.exception';
import { RefreshJwtPayloadDTO } from './dto/refresh-jwt-payload.dto';
import { UserRefreshJwtAuthContextDTO } from './dto/user-refresh-jwt-auth-context.dto';

/*Стратегия для авторизации по Refresh JWT, используя библиотеку Passport.js.*/
@Injectable()
export class RefreshJwtAuthStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  public constructor(
    public readonly authConfig: AuthConfig,
    private readonly authService: AuthPostgresqlService
  ) {
    /*Настраиваем как библиотеке Passport.js работать с Refresh JWT.*/
    super({
      /*Указываем извлекать токен из cookies.*/
      jwtFromRequest: ExtractJwt.fromExtractors([
        /*Указываем, что в объекте запросу могут быть cookies.*/
        (request: Request & { cookies?: Record<string, string | undefined> }): string | null => {
          return request?.cookies?.refreshToken ?? null;
        },
      ]),
      /*Указываем не игнорировать проверку срока годности токена.*/
      ignoreExpiration: false,
      /*Указываем секрет.*/
      secretOrKey: authConfig.RT_SECRET,
    });
  }

  /*Реализовываем метод "validate()", требуемый библиотекой Passport.js. Этот метод в данном случае принимает
  декодированный payload из Refresh JWT.*/
  public async validate(payload: RefreshJwtPayloadDTO): Promise<UserRefreshJwtAuthContextDTO> {
    /*Просим сервис "AuthService" валидировать payload из Refresh JWT.*/
    const user: UserPostgresqlDb | null = await this.authService.validateRefreshJwtPayload(payload);

    /*Если payload из Refresh JWT не был валидирован, то выбрасываем исключение "DomainException" с информацией об
    этом.*/
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.InvalidRefreshJwtPayload,
        message: 'Invalid Refresh JWT payload',
        field: 'cookies',
      });
    }

    /*Если payload из Refresh JWT был валидирован, то возвращаем ID пользователя и ID пользовательского устройства.*/
    return { id: payload.userId, deviceId: payload.deviceId, iat: new Date(payload.iat * 1000) };
  }
}
