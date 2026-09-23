import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EmailConfirmationListPostgresqlDb,
  EmailConfirmationPostgresqlDb,
} from './postgresql-types/email-confirmation-postgresql-db.type';
import {
  PasswordRecoveryCodeDataListPostgresqlDb,
  PasswordRecoveryCodeDataPostgresqlDb,
} from './postgresql-types/password-recovery-code-data-postgresql-db.type';
import { SessionListPostgresqlDb, SessionPostgresqlDb } from './postgresql-types/session-postgresql-db.type';

/*Репозиторий для работы с аутентификацией и авторизацией в PostgreSQL.*/
@Injectable()
export class AuthPostgresqlRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для создания данных о подтверждении регистрации пользователя в БД.*/
  public async createEmailConfirmation(dto: {
    userId: string;
    confirmationCode: string;
    expirationDate: Date;
  }): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO email_confirmations (user_id, confirmation_code, expiration_date) VALUES ($1, $2, $3)`,
      [dto.userId, dto.confirmationCode, dto.expirationDate]
    );
  }

  /*Метод для создания данных о коде восстановления пароля пользователя в БД.*/
  public async createPasswordRecoveryCodeData(dto: {
    userId: string;
    passwordRecoveryCode: string;
    expirationDate: Date;
  }): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO password_recovery_codes_data (user_id, password_recovery_code, expiration_date) VALUES ($1, $2, $3)`,
      [dto.userId, dto.passwordRecoveryCode, dto.expirationDate]
    );
  }

  /*Метод для создания пользовательской сессии в БД.*/
  public async createSession(dto: {
    userId: string;
    deviceId: string;
    deviceName: string;
    ip: string;
    iat: Date;
    exp: Date;
  }): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO sessions (user_id, device_id, device_name, ip, iat, exp) VALUES ($1, $2, $3, $4, $5, $6)`,
      [dto.userId, dto.deviceId, dto.deviceName, dto.ip, dto.iat, dto.exp]
    );
  }

  /*Метод для поиска данных о подтверждении регистрации пользователя по ID пользователя в БД.*/
  public async findEmailConfirmationByUserId(userId: string): Promise<EmailConfirmationPostgresqlDb | null> {
    const result: EmailConfirmationListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM email_confirmations WHERE user_id = $1`,
      [userId]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска данных о подтверждении регистрации пользователя по коду подтверждения регистрации пользователя в
  БД.*/
  public async findEmailConfirmationByCode(confirmationCode: string): Promise<EmailConfirmationPostgresqlDb | null> {
    const result: EmailConfirmationListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM email_confirmations WHERE confirmation_code = $1`,
      [confirmationCode]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска данных о коде восстановления пароля пользователя по ID пользователя в БД.*/
  public async findRecoveryPasswordCodeDataByUserId(
    userId: string
  ): Promise<PasswordRecoveryCodeDataPostgresqlDb | null> {
    const result: PasswordRecoveryCodeDataListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM password_recovery_codes_data WHERE user_id = $1`,
      [userId]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска данных о коде восстановления пароля пользователя по коду восстановления пароля пользователя в БД.*/
  public async findRecoveryPasswordCodeDataByPasswordRecoveryCode(
    passwordRecoveryCode: string
  ): Promise<PasswordRecoveryCodeDataPostgresqlDb | null> {
    const result: PasswordRecoveryCodeDataListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM password_recovery_codes_data WHERE password_recovery_code = $1`,
      [passwordRecoveryCode]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска пользовательской сессии по ID пользователя, ID пользовательского устройства и дате выдачи RT в
  БД.*/
  public async findSessionByUserIdAndDeviceIdAndIat(
    userId: string,
    deviceId: string,
    iat: Date
  ): Promise<SessionPostgresqlDb | null> {
    const result: SessionListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM sessions WHERE user_id = $1 AND device_id = $2 AND iat = $3 AND deleted_at IS NULL`,
      [userId, deviceId, iat]
    );

    return result[0] ?? null;
  }

  /*Метод для изменения данных о подтверждении регистрации пользователя по ID пользователя в БД.*/
  public async updateEmailConfirmationByUserId(
    userId: string,
    dto: { confirmationCode: string; expirationDate: Date }
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE email_confirmations SET confirmation_code = $1, expiration_date = $2 WHERE user_id = $3`,
      [dto.confirmationCode, dto.expirationDate, userId]
    );
  }

  /*Метод для изменения данных о коде восстановления пароля пользователя по ID пользователя в БД.*/
  public async updatePasswordRecoveryCodeDataByUserId(
    userId: string,
    dto: { passwordRecoveryCode: string; expirationDate: Date }
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE password_recovery_codes_data SET password_recovery_code = $1, expiration_date = $2 WHERE user_id = $3`,
      [dto.passwordRecoveryCode, dto.expirationDate, userId]
    );
  }

  /*Метод для изменения пользовательской сессии по ID пользователя, ID пользовательского устройства и дате выдачи RT в
  БД.*/
  public async updateSessionByUserIdAndDeviceIdAndIat(
    userId: string,
    deviceId: string,
    iat: Date,
    dto: { deviceName: string; ip: string; iat: Date; exp: Date }
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE sessions SET device_name = $1, ip = $2, iat = $3, exp = $4 WHERE user_id = $5 AND device_id = $6 AND iat = $7`,
      [dto.deviceName, dto.ip, dto.iat, dto.exp, userId, deviceId, iat]
    );
  }

  /*Метод для hard удаления всех данных о подтверждении регистрации пользователя по ID пользователя в БД.*/
  public async deleteAllEmailConfirmationsByUserId(userId: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM email_confirmations WHERE user_id = $1`, [userId]);
  }

  /*Метод для hard удаления данных о всех кодах восстановления пароля пользователя по ID пользователя в БД.*/
  public async deleteAllRecoveryCodesDataByUserId(userId: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM password_recovery_codes_data WHERE user_id = $1`, [userId]);
  }

  /*Метод для hard удаления пользовательской сессии по ID пользователя, ID пользовательского устройства и дате выдачи RT
  в БД.*/
  public async deleteSessionByUserIdAndDeviceIdAndIat(userId: string, deviceId: string, iat: Date): Promise<void> {
    await this.dataSource.query(`DELETE FROM sessions WHERE user_id = $1 AND device_id = $2 AND iat = $3`, [
      userId,
      deviceId,
      iat,
    ]);
  }

  /*Метод для hard удаления всех пользовательских сессий по ID пользователя и ID пользовательского устройства в БД.*/
  public async deleteAllSessionsExceptCurrentOneByUserIdAndSecurityDeviceId(
    userId: string,
    deviceId: string
  ): Promise<void> {
    await this.dataSource.query(`DELETE FROM sessions WHERE user_id = $1 AND device_id != $2`, [userId, deviceId]);
  }
}
