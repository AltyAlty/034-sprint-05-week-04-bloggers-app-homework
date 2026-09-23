/*Domain DTO для создания данных о коде восстановления пароля пользователя.*/
export class CreatePasswordRecoveryCodeDataDomainDTO {
  public userId: string;
  public passwordRecoveryCode: string;
  public expirationDate: Date;
}
