/*Domain DTO для изменения данных о подтверждении регистрации пользователя.*/
export class UpdateEmailConfirmationDomainDTO {
  public confirmationCode: string;
  public expirationDate: Date;
}
