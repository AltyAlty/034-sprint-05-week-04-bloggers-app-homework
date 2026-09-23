import { Injectable } from '@nestjs/common';
import { UsersPostgresqlQueryRepository } from '../../infrastructure/users/users-postgresql.query-repository';
import {
  UserListPostgresqlDb,
  UserPostgresqlDb,
} from '../../infrastructure/users/postgresql-types/user-postgresql-db.type';
import { GetUserListQueryInputDTO } from '../../api/users/input-dto/query/get-user-list-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { AuthUserDataOutputDTO } from '../../api/auth/output-dto/auth-user-data.output-dto';
import { UserOutputDTO } from '../../api/users/output-dto/user.output-dto';
import { UserListOutputDTO } from '../../api/users/output-dto/user-list.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';

/*Query-сервис для пользователей в PostgreSQL.*/
@Injectable()
export class UsersPostgresqlQueryService {
  public constructor(private readonly usersQueryRepository: UsersPostgresqlQueryRepository) {}

  /*Метод для получения данных о пользователе по ID пользователя при предоставлении AT.*/
  public async getAuthUserDataByUserId(id: string): Promise<AuthUserDataOutputDTO> {
    /*Просим query-репозиторий "usersQueryRepository" найти пользователя по ID в БД.*/
    const user: UserPostgresqlDb | null = await this.usersQueryRepository.findById(id);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileGettingAuthData,
        message: 'User to get auth data not found',
        field: 'id',
      });

    /*Если пользователь был найден, то преобразовываем пользователя из БД в подготовленные для отправки клиенту данные
    пользователя при предоставлении AT и возвращаем их.*/
    return AuthUserDataOutputDTO.mapFromUserPostgresqlDbToAuthUserDataOutputDTO(user);
  }

  /*Метод для поиска пользователей.*/
  public async findAll(dto: GetUserListQueryInputDTO): Promise<PaginationMetaDataOutputDTO<UserListOutputDTO>> {
    /*Просим query-репозиторий "UsersQueryRepository" найти пользователей в БД.*/
    const { items, totalCount }: { items: UserListPostgresqlDb; totalCount: number } =
      await this.usersQueryRepository.findAll(dto);

    /*Преобразовываем пользователей из БД в подготовленных для отправки клиенту пользователей.*/
    const userListOutput: UserListOutputDTO = UserOutputDTO.mapFromUserListPostgresqlDbToUserListOutputDTO(items);

    /*Преобразовываем подготовленных для отправки клиенту пользователей в подготовленных для отправки клиенту с
    пагинацией пользователей и возвращаем их.*/
    return PaginationMetaDataOutputDTO.mapToOutputDTO({
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: totalCount,
      items: userListOutput,
    });
  }
}
