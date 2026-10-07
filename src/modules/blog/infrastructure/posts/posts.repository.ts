import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostDb, PostListDb } from './types/post-db.type';
import { PostLikeDataDb, PostLikeDataListDb } from './types/post-like-data-db.type';
import { PostLikeStatusDomainDTO } from '../../domain/posts/domain-dto/post-like-status.domain-dto';

/*Репозиторий для постов.*/
@Injectable()
export class PostsRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для создания поста в БД.*/
  public async create(dto: {
    blogId: string;
    title: string;
    shortDescription: string;
    content: string;
  }): Promise<PostDb> {
    const result: PostListDb = await this.dataSource.query(
      `
      INSERT INTO posts (blog_id, title, short_description, content)
        VALUES ($1, $2, $3, $4)
      RETURNING 
        id, 
        blog_id, 
        (SELECT name FROM blogs WHERE id = $1) AS blog_name,
        title,
        short_description,
        content,
        likes_count,
        dislikes_count,
        created_at,
        deleted_at
      `,
      [dto.blogId, dto.title, dto.shortDescription, dto.content]
    );

    return result[0];
  }

  /*Метод для создания данных о лайке поста в БД.*/
  public async createPostLikeData(dto: {
    postId: string;
    blogId: string;
    userId: string;
    likeStatus: PostLikeStatusDomainDTO;
  }): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO post_likes_data (post_id, blog_id, user_id, like_status) VALUES ($1, $2, $3, $4)`,
      [dto.postId, dto.blogId, dto.userId, dto.likeStatus]
    );
  }

  /*Метод для поиска поста по ID в БД.*/
  public async findById(id: string): Promise<PostDb | null> {
    const result: PostListDb = await this.dataSource.query(
      `
      SELECT
        p.id,
        p.blog_id,
        b.name AS blog_name,
        p.title,
        p.short_description,
        p.content,
        p.likes_count,
        p.dislikes_count,
        p.created_at,
        p.deleted_at
        FROM posts p
      JOIN blogs b ON p.blog_id = b.id
        WHERE p.id = $1 AND p.deleted_at IS NULL
      `,
      [id]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async findPostLikeDataByPostIdAndUserId(postId: string, userId: string): Promise<PostLikeDataDb | null> {
    const result: PostLikeDataListDb = await this.dataSource.query(
      `SELECT * FROM post_likes_data WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    return result[0] ?? null;
  }

  /*Метод для изменения поста по ID в БД.*/
  public async updateById(
    id: string,
    dto: { title: string; shortDescription: string; content: string }
  ): Promise<void> {
    await this.dataSource.query(`UPDATE posts SET title = $1, short_description = $2, content = $3 WHERE id = $4`, [
      dto.title,
      dto.shortDescription,
      dto.content,
      id,
    ]);
  }

  /*Метод для изменения количества лайков и дизлайков у поста по ID в БД.*/
  public async updatePostLikesCountById(id: string, dto: { likesCount: number; dislikesCount: number }): Promise<void> {
    await this.dataSource.query(
      `UPDATE posts SET likes_count = likes_count + $1, dislikes_count = dislikes_count + $2 WHERE id = $3`,
      [dto.likesCount, dto.dislikesCount, id]
    );
  }

  /*Метод для изменения данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async updatePostLikeDataByPostIdAndUserId(
    postId: string,
    userId: string,
    likeStatus: PostLikeStatusDomainDTO
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE post_likes_data SET like_status = $1, added_at = $2 WHERE post_id = $3 AND user_id = $4`,
      [likeStatus, new Date(), postId, userId]
    );
  }

  /*Метод для soft удаления поста по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.dataSource.query(`UPDATE posts SET deleted_at = $1 WHERE id = $2`, [new Date(), id]);
  }

  /*Метод для hard удаления поста по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM posts WHERE id = $1`, [id]);
  }

  /*Метод для soft удаления постов по ID блога в БД.*/
  public async markAllAsDeletedByBlogId(id: string): Promise<void> {
    await this.dataSource.query(`UPDATE posts SET deleted_at = $1 WHERE blog_id = $2`, [new Date(), id]);
  }

  /*Метод для hard удаления постов по ID блога в БД.*/
  public async deleteAllByBlogId(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM posts WHERE blog_id = $1`, [id]);
  }

  /*Метод для soft удаления данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async markPostLikeDataAsDeletedByPostIdAndUserId(postId: string, userId: string): Promise<void> {
    await this.dataSource.query(`UPDATE post_likes_data SET deleted_at = $1 WHERE post_id = $1 AND user_id = $2`, [
      new Date(),
      postId,
      userId,
    ]);
  }

  /*Метод для hard удаления данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async deletePostLikeDataByPostIdAndUserId(postId: string, userId: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM post_likes_data WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
  }

  /*Метод для soft удаления данных о лайках поста по ID поста в БД.*/
  public async markAllPostLikeDataAsDeletedByPostId(id: string): Promise<void> {
    await this.dataSource.query(`UPDATE post_likes_data SET deleted_at = $1 WHERE post_id = $2`, [new Date(), id]);
  }

  /*Метод для hard удаления данных о лайках поста по ID поста в БД.*/
  public async deleteAllPostLikeDataByPostId(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM post_likes_data WHERE post_id = $1`, [id]);
  }

  /*Метод для soft удаления данных о лайках постов по ID блога в БД.*/
  public async markAllPostLikeDataAsDeletedByBlogId(id: string): Promise<void> {
    await this.dataSource.query(`UPDATE post_likes_data SET deleted_at = $1 WHERE blog_id = $2`, [new Date(), id]);
  }

  /*Метод для hard удаления данных о лайках постов по ID блога в БД.*/
  public async deleteAllPostLikeDataByBlogId(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM post_likes_data WHERE blog_id = $1`, [id]);
  }
}
