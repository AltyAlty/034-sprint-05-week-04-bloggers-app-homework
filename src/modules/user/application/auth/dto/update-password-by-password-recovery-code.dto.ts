/*DTO для установления нового пароля пользователя по коду восстановления пароля пользователя.*/
export class UpdatePasswordByPasswordRecoveryCodeDTO {
  public password: string;
  public recoveryCode: string;
}
