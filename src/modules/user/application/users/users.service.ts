import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Argon2Adapter } from '../../../../core/security/cryptography/argon2.adapter';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { UserOutputDTO } from '../../api/users/output-dto/user.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { Comment } from '../../../blog/domain/comments/comment.entity';
import { CommentLikeData } from '../../../blog/domain/comments/comment-like-data.entity';
import type { CommentModelType } from '../../../blog/domain/comments/model-types/comment.model-type';
import type { CommentLikeDataModelType } from '../../../blog/domain/comments/model-types/comment-like-data.model-type';
import { UserDocumentType } from '../../domain/users/document-types/user.document-type';
import type { UserModelType } from '../../domain/users/model-types/user.model-type';
import { User } from '../../domain/users/user.entity';
import { CreateUserDTO } from './dto/create-user.dto';

/*Сервис для пользователей.*/
@Injectable()
export class UsersService {
  public constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
    @InjectModel(CommentLikeData.name) private readonly commentLikeDataModel: CommentLikeDataModelType,
    private readonly argon2Adapter: Argon2Adapter,
    private readonly usersRepository: UsersRepository
  ) {}

  /*Метод для создания пользователя.*/
  public async create(dto: CreateUserDTO): Promise<string> {
    /*Просим репозиторий "UsersRepository" найти пользователя по логину в БД.*/
    let user: UserDocumentType | null = await this.usersRepository.findByLogin(dto.login);

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
    /*Просим модель "UserModel" создать пользователя.*/
    user = this.userModel.createInstance({ login: dto.login, email: dto.email, passwordHash });
    /*Просим репозиторий "UsersRepository" сохранить пользователя в БД.*/
    await this.usersRepository.save(user);
    /*Возвращаем ID созданного пользователя.*/
    return user.id;
  }

  /*Метод для создания подтвержденного пользователя.*/
  public async createConfirmedUser(dto: CreateUserDTO): Promise<UserOutputDTO> {
    /*Просим репозиторий "UsersRepository" найти пользователя по логину в БД.*/
    let user: UserDocumentType | null = await this.usersRepository.findByLogin(dto.login);

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
    /*Просим модель "UserModel" создать подтвержденного пользователя.*/
    user = this.userModel.createInstance({ login: dto.login, email: dto.email, passwordHash }, true);
    /*Просим репозиторий "UsersRepository" сохранить пользователя в БД.*/
    await this.usersRepository.save(user);
    /*Преобразовываем пользователя из БД в подготовленного для отправки клиенту
    пользователя и возвращаем его.*/
    return UserOutputDTO.mapFromUserDocumentTypeToUserOutputDTO(user);
  }

  /*Метод для soft удаления пользователя по ID.*/
  public async markAsDeletedById(id: string): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: UserDocumentType | null = await this.usersRepository.findById(id);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileDeleting,
        message: 'User to delete not found',
        field: 'code',
      });

    /*Если пользователь был найден, то помечаем его как удаленный.*/
    user.markAsDeleted();
    /*Просим репозиторий "UsersRepository" сохранить удаленного пользователя в БД.*/
    await this.usersRepository.save(user);
  }

  /*Метод для hard удаления пользователя по ID.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: UserDocumentType | null = await this.usersRepository.findById(id);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileDeleting,
        message: 'User to delete not found',
        field: 'code',
      });

    /*Если пользователь был найден, то просим репозиторий "UsersRepository" удалить пользователя по ID в БД.*/
    await this.usersRepository.deleteById(id);
    /*Просим модель "CommentModel" удалить данные о лайках комментариев по ID пользователя в БД.*/
    await this.commentLikeDataModel.deleteMany({ userId: id });
    /*Просим модель "CommentModel" удалить комментарии по ID пользователя в БД.*/
    await this.commentModel.deleteMany({ 'commentatorInfo.userId': id });
  }
}
