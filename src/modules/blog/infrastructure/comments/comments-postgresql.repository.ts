import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CommentLikeDataListPostgresqlDb,
  CommentLikeDataPostgresqlDb,
} from './postgresql-types/comment-like-data-postgresql-db.type';
import { CommentListPostgresqlDb, CommentPostgresqlDb } from './postgresql-types/comment-postgresql-db.type';
import { CommentLikeStatusDomainDTO } from '../../domain/comments/domain-dto/comment-like-status.domain-dto';

/*Репозиторий для комментариев в PostgreSQL.*/
@Injectable()
export class CommentsPostgresqlRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для создания комментария в БД.*/
  public async create(dto: {
    postId: string;
    blogId: string;
    userId: string;
    userLogin: string;
    content: string;
  }): Promise<CommentPostgresqlDb> {
    const result: CommentListPostgresqlDb = await this.dataSource.query(
      `INSERT INTO comments (post_id, blog_id, user_id, user_login, content) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dto.postId, dto.blogId, dto.userId, dto.userLogin, dto.content]
    );

    return result[0];
  }

  /*Метод для сохранения данных о лайке комментария в БД.*/
  public async createCommentLikeData(dto: {
    commentId: string;
    postId: string;
    blogId: string;
    userId: string;
    likeStatus: CommentLikeStatusDomainDTO;
  }): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO comment_likes_data (comment_id, post_id, blog_id, user_id, like_status) VALUES ($1, $2, $3, $4, $5)`,
      [dto.commentId, dto.postId, dto.blogId, dto.userId, dto.likeStatus]
    );
  }

  /*Метод для поиска комментария по ID в БД.*/
  public async findById(id: string): Promise<CommentPostgresqlDb | null> {
    const result: CommentListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM comments WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async findCommentLikeDataByCommentIdAndUserId(
    commentId: string,
    userId: string
  ): Promise<CommentLikeDataPostgresqlDb | null> {
    const result: CommentLikeDataListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM comment_likes_data WHERE comment_id = $1 AND user_id = $2`,
      [commentId, userId]
    );

    return result[0] ?? null;
  }

  /*Метод для изменения комментария по ID в БД.*/
  public async updateById(id: string, dto: { content: string }): Promise<void> {
    await this.dataSource.query(`UPDATE comments SET content = $1 WHERE id = $2`, [dto.content, id]);
  }

  /*Метод для изменения количества лайков и дизлайков у комментария по ID в БД.*/
  public async updateCommentLikesCountById(
    id: string,
    dto: { likesCount: number; dislikesCount: number }
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE comments SET likes_count = likes_count + $1, dislikes_count = dislikes_count + $2 WHERE id = $3`,
      [dto.likesCount, dto.dislikesCount, id]
    );
  }

  /*Метод для изменения данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async updateCommentLikeDataByCommentIdAndUserId(
    commentId: string,
    userId: string,
    likeStatus: CommentLikeStatusDomainDTO
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE comment_likes_data SET like_status = $1, added_at = $2 WHERE comment_id = $3 AND user_id = $4`,
      [likeStatus, new Date(), commentId, userId]
    );
  }

  /*Метод для soft удаления комментария по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.dataSource.query(`UPDATE comments SET deleted_at = $1 WHERE id = $2`, [new Date(), id]);
  }

  /*Метод для hard удаления комментария по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM comments WHERE id = $1`, [id]);
  }

  /*Метод для hard удаления комментариев по ID поста в БД.*/
  public async deleteAllByPostId(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM comments WHERE post_id = $1`, [id]);
  }

  /*Метод для hard удаления комментариев по ID блога в БД.*/
  public async deleteAllByBlogId(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM comments WHERE blog_id = $1`, [id]);
  }

  /*Метод для hard удаления комментариев по ID пользователя в БД.*/
  public async deleteAllByUserId(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM comments WHERE user_id = $1`, [id]);
  }

  /*Метод для hard удаления данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async deleteCommentLikeDataByCommentIdAndUserId(commentId: string, userId: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM comment_likes_data WHERE comment_id = $1 AND user_id = $2`, [
      commentId,
      userId,
    ]);
  }

  /*Метод для hard удаления данных о лайках комментария по ID комментария в БД.*/
  public async deleteAllCommentLikeDataByCommentId(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM comment_likes_data WHERE comment_id = $1`, [id]);
  }

  /*Метод для hard удаления данных о лайках комментариев по ID поста в БД.*/
  public async deleteAllCommentLikeDataByPostId(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM comment_likes_data WHERE post_id = $1`, [id]);
  }

  /*Метод для hard удаления данных о лайках комментария по ID блога в БД.*/
  public async deleteAllCommentLikeDataByBlogId(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM comment_likes_data WHERE blog_id = $1`, [id]);
  }

  /*Метод для hard удаления данных о лайках комментария по ID пользователя в БД.*/
  public async deleteAllCommentLikeDataByUserId(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM comment_likes_data WHERE user_id = $1`, [id]);
  }
}
