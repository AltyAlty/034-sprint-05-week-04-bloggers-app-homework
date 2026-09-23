import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogListPostgresqlDb, BlogPostgresqlDb } from './postgresql-types/blog-postgresql-db.type';

/*Репозиторий для блогов в PostgreSQL.*/
@Injectable()
export class BlogsPostgresqlRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для создания блога в БД.*/
  public async create(dto: { name: string; description: string; websiteUrl: string }): Promise<BlogPostgresqlDb> {
    const result: BlogListPostgresqlDb = await this.dataSource.query(
      `INSERT INTO blogs (name, description, website_url) VALUES ($1, $2, $3) RETURNING *`,
      [dto.name, dto.description, dto.websiteUrl]
    );

    return result[0];
  }

  /*Метод для поиска блога по ID в БД.*/
  public async findById(id: string): Promise<BlogPostgresqlDb | null> {
    const result: BlogListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM blogs WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    return result[0] ?? null;
  }

  /*Метод для изменения блога по ID в БД.*/
  public async updateById(id: string, dto: { name: string; description: string; websiteUrl: string }): Promise<void> {
    await this.dataSource.query(`UPDATE blogs SET name = $1, description = $2, website_url = $3 WHERE id = $4`, [
      dto.name,
      dto.description,
      dto.websiteUrl,
      id,
    ]);
  }

  /*Метод для soft удаления блога по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.dataSource.query(`UPDATE blogs SET deleted_at = $1 WHERE id = $2`, [new Date(), id]);
  }

  /*Метод для hard удаления блога по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM blogs WHERE id = $1`, [id]);
  }
}
