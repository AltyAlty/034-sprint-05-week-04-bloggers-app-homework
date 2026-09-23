import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { DomainException, DomainExceptionCode } from '../../exceptions/domain/domain.exception';

/*Гард для ограничения частоты запросов.*/
@Injectable()
export class RequestRateLimitingGuard extends ThrottlerGuard {
  /*Переопределяем метод получения трекера запросов, чтобы лимиты считались отдельно для связки IP-адреса и эндпоинта, а
  не только по IP-адресу как это происходит по умолчанию.*/
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return Promise.resolve(`${req.ip}:${req.method}:${req.path}`);
  }

  /*Переопределяем метод, выбрасывающий исключения, чтобы можно было работать с исключением DomainException.*/
  protected throwThrottlerException(): Promise<void> {
    throw new DomainException({ code: DomainExceptionCode.TooManyRequests, message: 'Too many requests', field: 'ip' });
  }
}
