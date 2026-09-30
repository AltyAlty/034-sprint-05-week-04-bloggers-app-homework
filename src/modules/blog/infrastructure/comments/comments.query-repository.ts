import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentLikeDataDb, CommentLikeDataListDb } from './types/comment-like-data-db.type';
import { CommentDb, CommentListDb } from './types/comment-postgresql-db.type';
import { SortDirectionInputDTO } from '../../../../core/pagination/input-dto/sort-direction.input-dto';
import { GetCommentListByPostIdQueryInputDTO } from '../../api/posts/input-dto/query/get-comment-list-by-post-id-query.input-dto';

/*Query-репозиторий для комментариев .*/
@Injectable()
export class CommentsQueryRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для поиска комментария по ID в БД.*/
  public async findById(id: string): Promise<CommentDb | null> {
    const result: CommentListDb = await this.dataSource.query(
      `
      SELECT
        c.id,
        c.post_id,
        c.blog_id,
        c.user_id,
        u.login AS user_login,
        c.content,
        c.likes_count,
        c.dislikes_count,
        c.created_at,
        c.deleted_at
        FROM comments c
      JOIN users u ON u.id = c.user_id
        WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска комментариев по ID поста в БД.*/
  public async findAllByPostId(
    postId: string,
    dto: GetCommentListByPostIdQueryInputDTO
  ): Promise<{ items: CommentListDb; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();

    /*Создаем список допустимых полей для сортировки в целях защиты от SQL-инъекций, так как имена полей в клаузу
    "ORDER BY" нельзя передавать параметрами через $1, поскольку СУБД считает параметры строго значениями данных.*/
    const allowedSortFields: Record<string, string> = {
      postId: 'c.post_id',
      content: 'c.content',
      createdAt: 'c.created_at',
    };

    /*Если пришедшее значение "dto.sortBy" нет в ключах словаря, то выбирается безопасный вариант "created_at".*/
    const sortField: string = allowedSortFields[dto.sortBy] ?? 'c.created_at';
    /*Маппим направления сортировки в ключевые слова PostgreSQL.*/
    const sortDirection: string = dto.sortDirection === SortDirectionInputDTO.Asc ? 'ASC' : 'DESC';
    /*Формируем параметр для модификатора "COLLATE", чтобы для текстовых полей использовалась ASCII-сортировку, а для
    дат - стандартная.*/
    const collation: string = sortField === 'c.created_at' ? '' : 'COLLATE "C"';

    /*Параллельно выполняем запрос данных и подсчет общего количества элементов.*/
    const [items, countResult] = (await Promise.all([
      this.dataSource.query(
        `
        SELECT
          c.id,
          c.post_id,
          c.blog_id,
          c.user_id,
          u.login AS user_login,
          c.content,
          c.likes_count,
          c.dislikes_count,
          c.created_at,
          c.deleted_at
          FROM comments c
        JOIN users u ON u.id = c.user_id
          WHERE c.deleted_at IS NULL AND c.post_id = $1
        ORDER BY ${sortField} ${collation} ${sortDirection}, c.id ASC
        LIMIT $2 OFFSET $3
        `,
        [postId, dto.pageSize, skip]
      ),

      this.dataSource.query(
        `
        SELECT COUNT(*) AS total
            FROM comments c
            WHERE c.deleted_at IS NULL AND c.post_id = $1
        `,
        [postId]
      ),
    ])) as [CommentListDb, { total: string }[]];

    /*Агрегатная функция "COUNT(*)" возвращает строку, поэтому приводим к числу.*/
    const totalCount: number = parseInt(countResult[0].total, 10);
    /*Возвращаем данные по комментариям.*/
    return { items, totalCount };
  }

  /*Метод для поиска данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async findCommentLikeDataByCommentIdAndUserId(
    commentId: string,
    userId: string
  ): Promise<CommentLikeDataDb | null> {
    const result: CommentLikeDataListDb = await this.dataSource.query(
      `SELECT * FROM comment_likes_data WHERE comment_id = $1 AND user_id = $2`,
      [commentId, userId]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска данных о лайках комментариев по ID комментариев и ID пользователя в БД.*/
  public async findAllCommentLikesDataByCommentIdsAndUserId(
    commentIds: string[],
    userId: string
  ): Promise<CommentLikeDataListDb> {
    return await this.dataSource.query(`SELECT * FROM comment_likes_data WHERE comment_id = ANY($1) AND user_id = $2`, [
      commentIds,
      userId,
    ]);
  }
}
