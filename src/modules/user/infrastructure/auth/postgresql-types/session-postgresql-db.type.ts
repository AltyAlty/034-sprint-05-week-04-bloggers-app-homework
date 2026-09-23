export class SessionPostgresqlDb {
  public id: string;
  public user_id: string;
  public device_id: string;
  public device_name: string;
  public ip: string;
  public iat: Date;
  public exp: Date;
  public created_at: Date;
  public deleted_at: Date | null;
}

export type SessionListPostgresqlDb = SessionPostgresqlDb[];
