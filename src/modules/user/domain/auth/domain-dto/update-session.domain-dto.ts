/*Domain DTO для изменения пользовательской сессии.*/
export class UpdateSessionDomainDTO {
  public deviceName: string;
  public ip: string;
  public iat: Date;
  public exp: Date;
}
