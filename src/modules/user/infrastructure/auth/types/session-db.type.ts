export class SessionDb {
  public id: string;
  public user_id: string;
  public device_id: string;
  public iat: Date;
  public exp: Date;
  public created_at: Date;
  public deleted_at: Date | null;
}

export type SessionListDb = SessionDb[];
