import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SecurityDeviceListDb } from './types/security-device-db.type';

/*Query-репозиторий для пользователей.*/
@Injectable()
export class SecurityDevicesQueryRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для поиска пользовательских устройств по ID пользователя в БД.*/
  public async findAllByUserId(userId: string): Promise<SecurityDeviceListDb> {
    return await this.dataSource.query(`SELECT * FROM security_devices WHERE user_id = $1 AND deleted_at IS NULL`, [
      userId,
    ]);
  }
}
