import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DomainException, DomainExceptionCode } from '../../exceptions/domain/domain.exception';

/*Гард для проверки наличия заголовка "user-agent" и IP-адреса пользователя в объекте запроса.*/
@Injectable()
export class IpAndUserAgentGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    /*Получаем объект запроса.*/
    const request: Request = context.switchToHttp().getRequest<Request>();

    /*Если в заголовках запроса нет заголовка "user-agent", то отклоняем выполнение запроса.*/
    if (!request.headers['user-agent'])
      throw new DomainException({
        code: DomainExceptionCode.NoUserAgentInRequest,
        message: 'No user-agent header in the request',
        field: 'user-agent',
      });

    /*Если в объекте запроса нет IP-адреса пользователя, то отклоняем выполнение запроса.*/
    if (!request.ip)
      throw new DomainException({
        code: DomainExceptionCode.NoIpInRequestObject,
        message: 'No IP in the request object',
        field: 'ip',
      });

    return true;
  }
}
