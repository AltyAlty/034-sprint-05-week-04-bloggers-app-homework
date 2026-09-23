import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogListPostgresqlDb, BlogPostgresqlDb } from './postgresql-types/blog-postgresql-db.type';
import { SortDirectionInputDTO } from '../../../../core/pagination/input-dto/sort-direction.input-dto';
import { GetBlogListQueryInputDTO } from '../../api/blogs/input-dto/query/get-blog-list-query.input-dto';

/*Query-репозиторий для блогов в PostgreSQL.*/
@Injectable()
export class BlogsPostgresqlQueryRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для поиска блога по ID в БД.*/
  public async findById(id: string): Promise<BlogPostgresqlDb | null> {
    const result: BlogListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM blogs WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска блогов в БД.*/
  public async findAll(dto: GetBlogListQueryInputDTO): Promise<{ items: BlogListPostgresqlDb; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();
    /*Подготавливаем параметры поиска. Если они переданы, то оборачиваем их в символ "%" и экранируем.*/
    const nameParam: string | null = dto.searchNameTerm ? `%${this._escapeLike(dto.searchNameTerm)}%` : null;

    /*Создаем список допустимых полей для сортировки в целях защиты от SQL-инъекций, так как имена полей в оператор
    "ORDER BY" нельзя передавать параметрами через $1, поскольку СУБД считает параметры строго значениями данных.*/
    const allowedSortFields: Record<string, string> = {
      name: 'name',
      description: 'description',
      websiteUrl: 'website_url',
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
            FROM blogs
            WHERE deleted_at IS NULL 
                AND (
                    ($1::text IS NULL)
                    OR ($1::text IS NOT NULL AND name ILIKE $1 ESCAPE '!')
                )           
            ORDER BY ${sortField} ${collation} ${sortDirection}
            LIMIT $2 OFFSET $3
        `,
        [nameParam, dto.pageSize, skip]
      ),

      this.dataSource.query(
        `
        SELECT COUNT(*) AS total
            FROM blogs
            WHERE deleted_at IS NULL
                AND (
                    ($1::text IS NULL)
                    OR ($1::text IS NOT NULL AND name ILIKE $1 ESCAPE '!')
                )
        `,
        [nameParam]
      ),
    ])) as [BlogListPostgresqlDb, { total: string }[]];

    /*Оператор "COUNT(*)" возвращает строку, поэтому приводим к числу.*/
    const totalCount: number = parseInt(countResult[0].total, 10);
    /*Возвращаем данные по блогам.*/
    return { items, totalCount };
  }

  private _escapeLike(value: string): string {
    return value.replace(/[!%_]/g, '!$&');
  }
}
