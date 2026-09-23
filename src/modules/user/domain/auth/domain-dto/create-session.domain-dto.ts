/*Domain DTO для создания пользовательской сессии.*/
export class CreateSessionDomainDTO {
  public userId: string;
  public deviceId: string;
  public deviceName: string;
  public ip: string;
  public iat: Date;
  public exp: Date;
}
