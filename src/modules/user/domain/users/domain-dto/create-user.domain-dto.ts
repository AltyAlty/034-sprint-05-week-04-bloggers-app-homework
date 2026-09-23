/*Domain DTO для создания пользователя.*/
export class CreateUserDomainDTO {
  public login: string;
  public email: string;
  public passwordHash: string;
}
