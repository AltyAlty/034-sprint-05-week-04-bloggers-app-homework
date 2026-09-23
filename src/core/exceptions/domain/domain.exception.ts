/*Коды исключений для доменного слоя.*/
export enum DomainExceptionCode {
  /*Auth.*/
  NoUserAgentInRequest = 101,
  NoIpInRequestObject = 102,
  TooManyRequests = 103,
  NoBasicAuthHeader = 104,
  InvalidBasicAuthType = 105,
  InvalidBasicAuthCredentials = 106,
  InvalidLocalAuthCredentials = 107,
  InvalidAccessJwtPayload = 108,
  InvalidAccessJwt = 109,
  InvalidRefreshJwtPayload = 110,
  InvalidRefreshJwt = 111,
  InvalidUserRegistrationConfirmationCode = 112,
  ExpiredUserRegistrationConfirmationCode = 113,
  InvalidPasswordRecoveryCode = 114,
  ExpiredPasswordRecoveryCode = 115,
  NoUserDataToExtractInRequest = 116,
  SessionAlreadyMarkedAsDeleted = 117,
  /*Security devices.*/
  SecurityDeviceNotfoundWhileRevokingSessionBySecurityDeviceId = 201,
  SecurityDeviceAlreadyMarkedAsDeleted = 202,
  /*Users.*/
  NotUniqueLoginToCreateUser = 301,
  NotUniqueEmailToCreateUser = 302,
  UserNotFoundWhileResendingConfirmationEmail = 303,
  UserNotFoundWhileRegistrationConfirmation = 304,
  UserNotFoundWhilePasswordRecovery = 305,
  UserNotFoundWhileGettingAuthData = 306,
  AlreadyConfirmedUserRegistration = 307,
  WrongSecurityDeviceOwnerWhileRevokingSessionBySecurityDeviceId = 308,
  UserNotFoundWhileDeleting = 309,
  UserAlreadyMarkedAsDeleted = 310,
  /*Blogs.*/
  BlogNotFoundWhilePostCreating = 401,
  BlogNotFound = 402,
  BlogNotFoundWhilePostSearching = 403,
  BlogNotFoundWhileUpdating = 404,
  BlogNotFoundWhilePostUpdating = 405,
  BlogNotFoundWhileDeleting = 406,
  BlogNotFoundWhilePostDeleting = 407,
  BlogAlreadyMarkedAsDeleted = 408,
  /*Posts.*/
  PostNotFoundWhileCommentCreating = 501,
  PostNotFound = 502,
  PostNotFoundWhileCommentSearching = 503,
  PostNotFoundWhileUpdating = 504,
  PostNotFoundWhileUpdatingLikeStatus = 505,
  PostNotFoundWhileDeleting = 506,
  PostAlreadyMarkedAsDeleted = 507,
  /*Comments.*/
  CommentNotFound = 601,
  CommentNotFoundWhileUpdating = 602,
  CommentNotFoundWhileUpdatingLikeStatus = 603,
  WrongCommentOwnerWhileUpdating = 604,
  CommentNotFoundWhileDeleting = 605,
  WrongCommentOwnerWhileDeleting = 606,
  CommentAlreadyMarkedAsDeleted = 607,
}

/*Класс исключений для доменного слоя.*/
export class DomainException extends Error {
  public readonly code: DomainExceptionCode;
  public readonly message: string;
  public readonly field?: string | undefined;

  public constructor(errorInfo: { code: DomainExceptionCode; message: string; field?: string }) {
    /*Встроенный родительский класс "Error" может принимать текст сообщения об ошибке.*/
    super(errorInfo.message);
    this.name = DomainException.name;
    this.code = errorInfo.code;
    this.message = errorInfo.message;
    this.field = errorInfo.field || '';
  }
}
