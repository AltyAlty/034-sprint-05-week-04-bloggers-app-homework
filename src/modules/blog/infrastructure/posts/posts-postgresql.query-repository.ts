import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  PostLikeDataListPostgresqlDb,
  PostLikeDataPostgresqlDb,
} from './postgresql-types/post-like-data-postgresql-db.type';
import { PostListPostgresqlDb, PostPostgresqlDb } from './postgresql-types/post-postgresql-db.type';
import { SortDirectionInputDTO } from '../../../../core/pagination/input-dto/sort-direction.input-dto';
import { GetPostListQueryInputDTO } from '../../api/posts/input-dto/query/get-post-list-query.input-dto';
import { NewestPostLikeOutputDTO } from '../../api/posts/output-dto/newest-post-like.output-dto';
import { NewestPostLikeListOutputDTO } from '../../api/posts/output-dto/newest-post-like-list.output-dto';
import { PostLikeStatusDomainDTO } from '../../domain/posts/domain-dto/post-like-status.domain-dto';

/*Query-репозиторий для постов в PostgreSQL.*/
@Injectable()
export class PostsPostgresqlQueryRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для поиска поста по ID в БД.*/
  public async findById(id: string): Promise<PostPostgresqlDb | null> {
    const result: PostListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM posts WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска постов в БД.*/
  public async findAll(
    dto: GetPostListQueryInputDTO,
    blogId?: string
  ): Promise<{ items: PostListPostgresqlDb; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();

    /*Создаем список допустимых полей для сортировки в целях защиты от SQL-инъекций, так как имена полей в оператор
    "ORDER BY" нельзя передавать параметрами через $1, поскольку СУБД считает параметры строго значениями данных.*/
    const allowedSortFields: Record<string, string> = {
      title: 'title',
      shortDescription: 'short_description',
      content: 'content',
      blogId: 'blog_id',
      blogName: 'blog_name',
      createdAt: 'created_at',
    };

    /*Если пришедшее значение "dto.sortBy" нет в ключах словаря, то выбирается безопасный вариант "created_at".*/
    const sortField: string = allowedSortFields[dto.sortBy] ?? 'created_at';
    /*Маппим направления сортировки в ключевые слова PostgreSQL.*/
    const sortDirection: string = dto.sortDirection === SortDirectionInputDTO.Asc ? 'ASC' : 'DESC';
    /*Формируем параметр для "COLLATE", чтобы для текстовых полей использовалась ASCII-сортировку, а для дат -
    стандартная.*/
    const collation: string = sortField === 'created_at' ? '' : 'COLLATE "C"';

    /*Параллельно выполняем запрос данных и подсчет общего количества элементов.*/
    const [items, countResult] = (await Promise.all([
      this.dataSource.query(
        `
        SELECT *
            FROM posts
            WHERE deleted_at IS NULL AND ($1::text IS NULL OR blog_id = $1::uuid)
            ORDER BY ${sortField} ${collation} ${sortDirection}
            LIMIT $2 OFFSET $3
        `,
        [blogId ?? null, dto.pageSize, skip]
      ),

      this.dataSource.query(
        `
        SELECT COUNT(*) AS total
            FROM posts
            WHERE deleted_at IS NULL AND ($1::text IS NULL OR blog_id = $1::uuid)
        `,
        [blogId ?? null]
      ),
    ])) as [PostListPostgresqlDb, { total: string }[]];

    /*Оператор "COUNT(*)" возвращает строку, поэтому приводим к числу.*/
    const totalCount: number = parseInt(countResult[0].total, 10);
    /*Возвращаем данные по постам.*/
    return { items, totalCount };
  }

  /*Метод для поиска данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async findPostLikeDataByPostIdAndUserId(
    postId: string,
    userId: string
  ): Promise<PostLikeDataPostgresqlDb | null> {
    const result: PostLikeDataListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM post_likes_data WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска данных о лайках постов по ID постов и ID пользователя в БД.*/
  public async findAllPostLikesDataByPostIdsAndUserId(
    postIds: string[],
    userId: string
  ): Promise<PostLikeDataListPostgresqlDb> {
    return await this.dataSource.query(`SELECT * FROM post_likes_data WHERE post_id = ANY($1) AND user_id = $2`, [
      postIds,
      userId,
    ]);
  }

  /*Метод для поиска данных о трех последних лайках поста по ID поста в БД.*/
  public async findLastThreePostLikes(postId: string): Promise<NewestPostLikeListOutputDTO> {
    const result: PostLikeDataListPostgresqlDb = await this.dataSource.query(
      `
    SELECT user_id, login, added_at
        FROM post_likes_data
        WHERE post_id = $1 AND like_status = $2
        ORDER BY added_at DESC
        LIMIT 3
    `,
      [postId, PostLikeStatusDomainDTO.Like]
    );

    return result.map((like: PostLikeDataPostgresqlDb): NewestPostLikeOutputDTO => ({
      addedAt: like.added_at,
      userId: like.user_id,
      login: like.login,
    }));
  }

  /*Метод для поиска данных о трех последних лайках постов по ID постов в БД.*/
  public async findLastThreeLikesForPostsByPostIds(
    postIds: string[]
  ): Promise<Map<string, NewestPostLikeListOutputDTO>> {
    /*Если массив ID постов пустой, то возвращаем пустой Map.*/
    if (postIds.length === 0) return new Map();

    /*Используем оконную функцию "ROW_NUMBER()" для нумерации лайков внутри каждого поста в порядке убывания по дате.
    Затем берем только первые три лайка для каждого поста.*/
    const result: (PostLikeDataPostgresqlDb & { post_id: string })[] = await this.dataSource.query(
      `
      SELECT post_id, user_id, login, added_at
        FROM (
            SELECT post_id, user_id, login, added_at, ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY added_at DESC) AS rn
                FROM post_likes_data
                WHERE post_id = ANY($1) AND like_status = $2
    ) subquery
        WHERE rn <= 3
    `,
      [postIds, PostLikeStatusDomainDTO.Like]
    );

    /*Создаем Map формата "postId: NewestPostLikeListOutputDTO" для группировки результата.*/
    const map: Map<string, NewestPostLikeListOutputDTO> = new Map<string, NewestPostLikeListOutputDTO>();

    /*Перебираем каждый лайк из результата.*/
    for (const like of result) {
      /*Если в Map еще нет записи для какого-то поста, то создаем пустой массив лайков для него.*/
      if (!map.has(like.post_id)) map.set(like.post_id, []);
      /*Добавляем текущий лайк в массив лайков соответствующего поста.*/
      map.get(like.post_id)!.push({ addedAt: like.added_at, userId: like.user_id, login: like.login });
    }

    /*Возвращаем данные о трех последних лайках постов.*/
    return map;
  }
}
