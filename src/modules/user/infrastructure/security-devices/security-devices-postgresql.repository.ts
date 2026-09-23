import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  SecurityDeviceListPostgresqlDb,
  SecurityDevicePostgresqlDb,
} from './postgresql-types/security-device-postgresql-db.type';

/*Репозиторий для пользовательских устройств в PostgreSQL.*/
@Injectable()
export class SecurityDevicesPostgresqlRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для создания пользовательского устройства в БД.*/
  public async create(dto: {
    deviceId: string;
    userId: string;
    title: string;
    ip: string;
    lastActiveDate: Date;
  }): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO security_devices (device_id, user_id, title, ip, last_active_date) VALUES ($1, $2, $3, $4, $5)`,
      [dto.deviceId, dto.userId, dto.title, dto.ip, dto.lastActiveDate]
    );
  }

  /*Метод для поиска пользовательского устройства по ID в БД.*/
  public async findById(id: string): Promise<SecurityDevicePostgresqlDb | null> {
    const result: SecurityDeviceListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM security_devices WHERE device_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    return result[0] ?? null;
  }

  /*Метод для изменения пользовательского устройства по ID в БД.*/
  public async updateById(id: string, dto: { title: string; ip: string; lastActiveDate: Date }): Promise<void> {
    await this.dataSource.query(
      `UPDATE security_devices SET title = $1, ip = $2, last_active_date = $3 WHERE device_id = $4`,
      [dto.title, dto.ip, dto.lastActiveDate, id]
    );
  }

  /*Метод для hard удаления пользовательского устройства по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM security_devices WHERE device_id = $1`, [id]);
  }

  /*Метод для hard удаления всех пользовательских устройств, кроме текущего, по ID пользовательского устройства и ID
  пользователя в БД.*/
  public async deleteAllExceptCurrentOneBySecurityDeviceIdAndUserId(id: string, userId: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM security_devices WHERE user_id = $1 AND device_id != $2`, [userId, id]);
  }
}
