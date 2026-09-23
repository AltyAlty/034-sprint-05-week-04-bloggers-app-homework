export class SecurityDevicePostgresqlDb {
  public device_id: string;
  public user_id: string;
  public title: string;
  public ip: string;
  public last_active_date: Date;
  public created_at: Date;
  public deleted_at: Date | null;
}

export type SecurityDeviceListPostgresqlDb = SecurityDevicePostgresqlDb[];
