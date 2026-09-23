/*Domain DTO для создания данных о подтверждении регистрации пользователя.*/
export class CreateEmailConfirmationDomainDTO {
  public userId: string;
  public confirmationCode: string;
  public expirationDate: Date;
}
