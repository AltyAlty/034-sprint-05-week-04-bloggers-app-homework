/*DTO для валидации учетных данных пользователя при аутентификации по логину или email и паролю.*/
export class ValidateUserLocalAuthCredentialsDTO {
  public loginOrEmail: string;
  public password: string;
}
