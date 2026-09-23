export class PasswordRecoveryCodeDataPostgresqlDb {
  public id: string;
  public user_id: string;
  public password_recovery_code: string;
  public expiration_date: Date;
}

export type PasswordRecoveryCodeDataListPostgresqlDb = PasswordRecoveryCodeDataPostgresqlDb[];
