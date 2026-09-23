import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException, DomainExceptionCode } from '../../exceptions/domain/domain.exception';
import { UserRefreshJwtAuthContextDTO } from './dto/user-refresh-jwt-auth-context.dto';

/*Гард для авторизации по Refresh JWT, используя библиотеку Passport.js.*/
@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('refresh-jwt') {
  public handleRequest<TUser = UserRefreshJwtAuthContextDTO>(error: any, user: TUser): TUser {
    if (error instanceof DomainException) throw error;

    if (error || !user) {
      throw new DomainException({
        code: DomainExceptionCode.InvalidRefreshJwt,
        message: 'Invalid Refresh JWT',
        field: 'cookies',
      });
    }

    return user;
  }
}
