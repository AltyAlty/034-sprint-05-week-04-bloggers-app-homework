import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/*Сервис для тестирования приложения.*/
@Injectable()
export class TestingService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для очистки таблиц в PostgreSQL.*/
  public async clearDb(): Promise<void> {
    await this.dataSource.query(`
      TRUNCATE TABLE 
        users, 
        email_confirmations, 
        password_recovery_codes_data, 
        security_devices, 
        sessions,
        blogs,
        posts,
        post_likes_data,
        comments,
        comment_likes_data
      CASCADE;
    `);
  }
}
