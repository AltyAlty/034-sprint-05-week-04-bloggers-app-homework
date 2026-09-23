export class UserPostgresqlDb {
  public id: string;
  public login: string;
  public original_email: string;
  public email: string;
  public password_hash: string;
  public is_confirmed: boolean;
  public created_at: Date;
  public deleted_at: null;
}

export type UserListPostgresqlDb = UserPostgresqlDb[];
