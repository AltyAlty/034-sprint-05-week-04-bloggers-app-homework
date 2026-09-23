/*Domain DTO для изменения данных о коде восстановления пароля пользователя.*/
export class UpdatePasswordRecoveryCodeDataDomainDTO {
  public passwordRecoveryCode: string;
  public expirationDate: Date;
}
