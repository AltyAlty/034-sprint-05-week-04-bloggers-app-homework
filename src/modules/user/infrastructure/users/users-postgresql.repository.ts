import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserListPostgresqlDb, UserPostgresqlDb } from './postgresql-types/user-postgresql-db.type';
import { normalizeEmail } from '../../../../core/utils/email/normalize-email.util';

/*Репозиторий для пользователей в PostgreSQL.*/
@Injectable()
export class UsersPostgresqlRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для создания пользователя в БД.*/
  public async create(dto: { login: string; email: string; passwordHash: string }): Promise<string> {
    const result: { id: string }[] = await this.dataSource.query(
      `INSERT INTO users (login, original_email, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id`,
      [dto.login, dto.email, normalizeEmail(dto.email), dto.passwordHash]
    );

    return result[0].id;
  }

  /*Метод для создания подтвержденного пользователя в БД.*/
  public async createConfirmed(dto: { login: string; email: string; passwordHash: string }): Promise<UserPostgresqlDb> {
    const result: UserListPostgresqlDb = await this.dataSource.query(
      `INSERT INTO users (login, original_email, email, password_hash, is_confirmed) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dto.login, dto.email, normalizeEmail(dto.email), dto.passwordHash, true]
    );

    return result[0];
  }

  /*Метод для поиска пользователя по ID в БД.*/
  public async findById(id: string): Promise<UserPostgresqlDb | null> {
    const result: UserListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска пользователя по логину в БД.*/
  public async findByLogin(login: string): Promise<UserPostgresqlDb | null> {
    const result: UserListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM users WHERE LOWER(login) = LOWER($1) AND deleted_at IS NULL`,
      [login]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска пользователя по email в БД.*/
  public async findByEmail(email: string): Promise<UserPostgresqlDb | null> {
    const result: UserListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL`,
      [normalizeEmail(email)]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска пользователя по логину или email в БД.*/
  public async findByLoginOrEmail(loginOrEmail: string): Promise<UserPostgresqlDb | null> {
    const result: UserListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM users  WHERE (email = $1 OR login = $2) AND deleted_at IS NULL`,
      [normalizeEmail(loginOrEmail), loginOrEmail]
    );

    return result[0] ?? null;
  }

  /*Метод для подтверждения регистрации пользователя по ID пользователя в БД.*/
  public async confirmUserById(id: string): Promise<void> {
    await this.dataSource.query(`UPDATE users SET is_confirmed = true WHERE id = $1`, [id]);
  }

  /*Метод для изменения хеша пароля пользователя по ID в БД.*/
  public async updateUserPasswordHashById(id: string, passwordHash: string): Promise<void> {
    await this.dataSource.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, id]);
  }

  /*Метод для soft удаления пользователя по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.dataSource.query(`UPDATE users SET deleted_at = $1 WHERE id = $2`, [new Date(), id]);
  }

  /*Метод для hard удаления пользователя по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM users WHERE id = $1`, [id]);
  }
}
