import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SecurityDeviceListPostgresqlDb } from './postgresql-types/security-device-postgresql-db.type';

/*Query-репозиторий для пользователей в PostgreSQL.*/
@Injectable()
export class SecurityDevicesPostgresqlQueryRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для поиска пользовательских устройств по ID пользователя в БД.*/
  public async findAllByUserId(userId: string): Promise<SecurityDeviceListPostgresqlDb> {
    return await this.dataSource.query(`SELECT * FROM security_devices WHERE user_id = $1 AND deleted_at IS NULL`, [
      userId,
    ]);
  }
}
