import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserListPostgresqlDb, UserPostgresqlDb } from './postgresql-types/user-postgresql-db.type';
import { SortDirectionInputDTO } from '../../../../core/pagination/input-dto/sort-direction.input-dto';
import { GetUserListQueryInputDTO } from '../../api/users/input-dto/query/get-user-list-query.input-dto';

/*Query-репозиторий для пользователей в PostgreSQL.*/
@Injectable()
export class UsersPostgresqlQueryRepository {
  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*Метод для поиска пользователя по ID в БД.*/
  public async findById(id: string): Promise<UserPostgresqlDb | null> {
    const result: UserListPostgresqlDb = await this.dataSource.query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    return result[0] ?? null;
  }

  /*Метод для поиска пользователей в БД.*/
  public async findAll(dto: GetUserListQueryInputDTO): Promise<{ items: UserListPostgresqlDb; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();
    /*Подготавливаем параметры поиска. Если они переданы, то оборачиваем их в символ "%" и экранируем.*/
    const loginParam: string | null = dto.searchLoginTerm ? `%${this._escapeLike(dto.searchLoginTerm)}%` : null;
    const emailParam: string | null = dto.searchEmailTerm ? `%${this._escapeLike(dto.searchEmailTerm)}%` : null;
    /*Создаем список допустимых полей для сортировки в целях защиты от SQL-инъекций, так как имена полей в оператор
    "ORDER BY" нельзя передавать параметрами через $1, поскольку СУБД считает параметры строго значениями данных.*/
    const allowedSortFields: Record<string, string> = { login: 'login', email: 'email', createdAt: 'created_at' };
    /*Если пришедшее значение "dto.sortBy" нет в ключах словаря, то выбирается безопасный вариант "created_at".*/
    const sortField: string = allowedSortFields[dto.sortBy] ?? 'created_at';
    /*Маппим направления сортировки в ключевые слова PostgreSQL.*/
    const sortDirection: string = dto.sortDirection === SortDirectionInputDTO.Asc ? 'ASC' : 'DESC';
    /*Формируем параметр для "COLLATE", чтобы для текстовых полей использовалась ASCII-сортировку, а для дат -
    стандартная.*/
    const collation: string = sortField === 'created_at' ? '' : 'COLLATE "C"';

    /*Параллельно выполняем запрос данных и подсчет общего количества элементов.*/
    const [items, countResult] = (await Promise.all([
      /*Проверяем:
      1. Если не было указано условий для поиска по логину и email, то проверяем только на soft удаление.
      2. Если было указано условие для поиска по логину, то проверяем:
      2.1 Что значение по полю "login" подходит к условию для поиска по логину.
      2.2 На soft удаление.
      3. Если было указано условие для поиска по email, то проверяем:
      3.1 Что значение по полю "email" подходит к условию для поиска по email.
      3.2 На soft удаление.
      4. Если были указаны условия для поиска по логину и email, то проверяем
      4.1 Что значение по полю "login" подходит к условию для поиска по логину, либо что значение по полю "email"
      подходит к условию для поиска по email.
      4.2 На soft удаление.

      Приведение типов здесь нужно, так как PostgreSQL не может сам определить тип передаваемых параметров.*/
      this.dataSource.query(
        `
        SELECT *
            FROM users
            WHERE deleted_at IS NULL
                AND (
                    ($1::text IS NULL AND $2::text IS NULL)
                    OR ($1::text IS NOT NULL AND login ILIKE $1 ESCAPE '!')
                    OR ($2::text IS NOT NULL AND email ILIKE $2 ESCAPE '!')
                )
            ORDER BY ${sortField} ${collation} ${sortDirection}
            LIMIT $3 OFFSET $4
        `,
        [loginParam, emailParam, dto.pageSize, skip]
      ),

      this.dataSource.query(
        `
        SELECT COUNT(*) AS total
            FROM users
            WHERE deleted_at IS NULL
                AND (
                    ($1::text IS NULL AND $2::text IS NULL)
                    OR ($1::text IS NOT NULL AND login ILIKE $1 ESCAPE '!')
                    OR ($2::text IS NOT NULL AND email ILIKE $2 ESCAPE '!')
                )
        `,
        [loginParam, emailParam]
      ),
    ])) as [UserListPostgresqlDb, { total: string }[]];

    /*Оператор "COUNT(*)" возвращает строку, поэтому приводим к числу.*/
    const totalCount: number = parseInt(countResult[0].total, 10);
    /*Возвращаем данные по пользователям.*/
    return { items, totalCount };
  }

  /*Создаем метод, который ставит символ "!" перед символами "!", "%" и "_" в строке. Это нужно, так как в SQL-операторе
  "ILIKE" символы "%" и "_" являются командами поиска, а символ "!" является символом экранирования, и если пользователь
  введет любой из них в строке поиска, то БД воспримет их как команды, а не как обычные символы, что сломает логику
  поиска.*/
  private _escapeLike(value: string): string {
    return value.replace(/[!%_]/g, '!$&');
  }
}
