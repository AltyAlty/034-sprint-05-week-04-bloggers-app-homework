import { Injectable } from '@nestjs/common';
import { Argon2Adapter } from '../../../../core/security/cryptography/argon2.adapter';
import { CommentsPostgresqlRepository } from '../../../blog/infrastructure/comments/comments-postgresql.repository';
import { UsersPostgresqlRepository } from '../../infrastructure/users/users-postgresql.repository';
import { UserPostgresqlDb } from '../../infrastructure/users/postgresql-types/user-postgresql-db.type';
import { UserOutputDTO } from '../../api/users/output-dto/user.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { CreateUserDTO } from './dto/create-user.dto';

/*Сервис для пользователей в PostgreSQL.*/
@Injectable()
export class UsersPostgresqlService {
  public constructor(
    private readonly argon2Adapter: Argon2Adapter,
    private readonly usersRepository: UsersPostgresqlRepository,
    private readonly commentsRepository: CommentsPostgresqlRepository
  ) {}

  /*Метод для создания пользователя.*/
  public async create(dto: CreateUserDTO): Promise<string> {
    /*Просим репозиторий "UsersRepository" найти пользователя по логину в БД.*/
    let user: UserPostgresqlDb | null = await this.usersRepository.findByLogin(dto.login);

    /*Если пользователь был найден, то выбрасываем исключение с информацией об этом.*/
    if (user)
      throw new DomainException({
        code: DomainExceptionCode.NotUniqueLoginToCreateUser,
        message: 'Login must be unique',
        field: 'login',
      });

    /*Просим репозиторий "UsersRepository" найти пользователя по email в БД.*/
    user = await this.usersRepository.findByEmail(dto.email);

    /*Если пользователь был найден, то выбрасываем исключение с информацией об этом.*/
    if (user)
      throw new DomainException({
        code: DomainExceptionCode.NotUniqueEmailToCreateUser,
        message: 'Email must be unique',
        field: 'email',
      });

    /*Если пользователь еще не был создан, то просим адаптер "Argon2Adapter" сгенерировать хеш для пароля.*/
    const passwordHash: string = await this.argon2Adapter.generatePasswordHash(dto.password);
    /*Просим репозиторий "UsersRepository" создать пользователя в БД.*/
    return await this.usersRepository.create({ login: dto.login, email: dto.email, passwordHash });
  }

  /*Метод для создания подтвержденного пользователя.*/
  public async createConfirmedUser(dto: CreateUserDTO): Promise<UserOutputDTO> {
    /*Просим репозиторий "UsersRepository" найти пользователя по логину в БД.*/
    let user: UserPostgresqlDb | null = await this.usersRepository.findByLogin(dto.login);

    /*Если пользователь был найден, то выбрасываем исключение с информацией об этом.*/
    if (user)
      throw new DomainException({
        code: DomainExceptionCode.NotUniqueLoginToCreateUser,
        message: 'Login must be unique',
        field: 'login',
      });

    /*Просим репозиторий "UsersRepository" найти пользователя по email в БД.*/
    user = await this.usersRepository.findByEmail(dto.email);

    /*Если пользователь был найден, то выбрасываем исключение с информацией об этом.*/
    if (user)
      throw new DomainException({
        code: DomainExceptionCode.NotUniqueEmailToCreateUser,
        message: 'Email must be unique',
        field: 'email',
      });

    /*Если пользователь еще не был создан, то просим адаптер "Argon2Adapter" сгенерировать хеш для пароля.*/
    const passwordHash: string = await this.argon2Adapter.generatePasswordHash(dto.password);

    /*Просим репозиторий "UsersRepository" создать подтвержденного пользователя в БД.*/
    const createdUser: UserPostgresqlDb = await this.usersRepository.createConfirmed({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });

    return UserOutputDTO.mapFromUserPostgresqlDbToUserOutputDTO(createdUser);
  }

  /*Метод для soft удаления пользователя по ID.*/
  public async markAsDeletedById(id: string): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: UserPostgresqlDb | null = await this.usersRepository.findById(id);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileDeleting,
        message: 'User to delete not found',
        field: 'code',
      });

    /*Если пользователь был найден, то просим репозиторий "UsersRepository" пометить его как удаленный в БД.*/
    await this.usersRepository.markAsDeletedById(id);
  }

  /*Метод для hard удаления пользователя по ID.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: UserPostgresqlDb | null = await this.usersRepository.findById(id);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileDeleting,
        message: 'User to delete not found',
        field: 'code',
      });

    /*Если пользователь был найден, то просим репозиторий "UsersRepository" удалить пользователя по ID в БД.*/
    await this.usersRepository.deleteById(id);
    /*Просим репозиторий "CommentsRepository" удалить данные о лайках комментариев по ID пользователя в БД.*/
    await this.commentsRepository.deleteAllCommentLikeDataByUserId(id);
    /*Просим репозиторий "CommentsRepository" удалить комментарии по ID пользователя в БД.*/
    await this.commentsRepository.deleteAllByUserId(id);
  }
}
