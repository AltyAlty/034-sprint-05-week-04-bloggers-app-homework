import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainException, DomainExceptionCode } from '../../exceptions/domain/domain.exception';

/*Фильтр исключений "DomainException".*/
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  public catch(exception: DomainException, host: ArgumentsHost): void {
    /*Переключаем на контекст работы с протоколом HTTP.*/
    const ctx = host.switchToHttp();
    /*Получаем объект ответа.*/
    const response: Response = ctx.getResponse<Response>();
    /*Формирует код ответа клиенту.*/
    const status: number = this.mapFromDomainExceptionCodeToHttpStatus(exception.code);
    /*Отправляем ответ клиенту.*/
    response.status(status).json({ errorsMessages: [{ message: exception.message, field: exception.field }] });
  }

  /*Маппер для преобразования статусов кодов ответов из формата для доменного слоя в формат для ответов клиенту.*/
  private mapFromDomainExceptionCodeToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.NoBasicAuthHeader:
      case DomainExceptionCode.InvalidBasicAuthType:
      case DomainExceptionCode.InvalidBasicAuthCredentials:
      case DomainExceptionCode.InvalidLocalAuthCredentials:
      case DomainExceptionCode.InvalidAccessJwtPayload:
      case DomainExceptionCode.InvalidAccessJwt:
      case DomainExceptionCode.InvalidRefreshJwtPayload:
      case DomainExceptionCode.InvalidRefreshJwt:
      case DomainExceptionCode.UserNotFoundWhileGettingAuthData:
      case DomainExceptionCode.NoUserDataToExtractInRequest:
        return HttpStatus.UNAUTHORIZED;

      case DomainExceptionCode.NoUserAgentInRequest:
      case DomainExceptionCode.NoIpInRequestObject:
      case DomainExceptionCode.SessionAlreadyMarkedAsDeleted:
      case DomainExceptionCode.SecurityDeviceAlreadyMarkedAsDeleted:
      case DomainExceptionCode.InvalidUserRegistrationConfirmationCode:
      case DomainExceptionCode.ExpiredUserRegistrationConfirmationCode:
      case DomainExceptionCode.InvalidPasswordRecoveryCode:
      case DomainExceptionCode.ExpiredPasswordRecoveryCode:
      case DomainExceptionCode.NotUniqueLoginToCreateUser:
      case DomainExceptionCode.NotUniqueEmailToCreateUser:
      case DomainExceptionCode.UserNotFoundWhileResendingConfirmationEmail:
      case DomainExceptionCode.UserNotFoundWhileRegistrationConfirmation:
      case DomainExceptionCode.UserNotFoundWhilePasswordRecovery:
      case DomainExceptionCode.AlreadyConfirmedUserRegistration:
      case DomainExceptionCode.UserAlreadyMarkedAsDeleted:
      case DomainExceptionCode.BlogAlreadyMarkedAsDeleted:
      case DomainExceptionCode.PostAlreadyMarkedAsDeleted:
      case DomainExceptionCode.CommentAlreadyMarkedAsDeleted:
        return HttpStatus.BAD_REQUEST;

      case DomainExceptionCode.SecurityDeviceNotfoundWhileRevokingSessionBySecurityDeviceId:
      case DomainExceptionCode.UserNotFoundWhileDeleting:
      case DomainExceptionCode.BlogNotFoundWhilePostCreating:
      case DomainExceptionCode.BlogNotFound:
      case DomainExceptionCode.BlogNotFoundWhilePostSearching:
      case DomainExceptionCode.BlogNotFoundWhileUpdating:
      case DomainExceptionCode.BlogNotFoundWhilePostUpdating:
      case DomainExceptionCode.BlogNotFoundWhileDeleting:
      case DomainExceptionCode.BlogNotFoundWhilePostDeleting:
      case DomainExceptionCode.PostNotFoundWhileCommentCreating:
      case DomainExceptionCode.PostNotFound:
      case DomainExceptionCode.PostNotFoundWhileCommentSearching:
      case DomainExceptionCode.PostNotFoundWhileUpdating:
      case DomainExceptionCode.PostNotFoundWhileUpdatingLikeStatus:
      case DomainExceptionCode.PostNotFoundWhileDeleting:
      case DomainExceptionCode.CommentNotFound:
      case DomainExceptionCode.CommentNotFoundWhileUpdating:
      case DomainExceptionCode.CommentNotFoundWhileUpdatingLikeStatus:
      case DomainExceptionCode.CommentNotFoundWhileDeleting:
        return HttpStatus.NOT_FOUND;

      case DomainExceptionCode.WrongSecurityDeviceOwnerWhileRevokingSessionBySecurityDeviceId:
      case DomainExceptionCode.WrongCommentOwnerWhileUpdating:
      case DomainExceptionCode.WrongCommentOwnerWhileDeleting:
        return HttpStatus.FORBIDDEN;

      case DomainExceptionCode.TooManyRequests:
        return HttpStatus.TOO_MANY_REQUESTS;

      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }
}
