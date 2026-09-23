export class EmailConfirmationPostgresqlDb {
  public id: string;
  public user_id: string;
  public confirmation_code: string;
  public expiration_date: Date;
}

export type EmailConfirmationListPostgresqlDb = EmailConfirmationPostgresqlDb[];
