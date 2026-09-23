/*DTO для данных о пользователе, который прошел авторизацию по Refresh JWT.*/
export class UserRefreshJwtAuthContextDTO {
  public id: string;
  public deviceId: string;
  public iat: Date;
}
