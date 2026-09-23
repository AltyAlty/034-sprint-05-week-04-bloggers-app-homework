import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';
import { GetUserListQueryInputDTO } from '../../api/users/input-dto/query/get-user-list-query.input-dto';
import { UserDocumentType } from '../../domain/users/document-types/user.document-type';
import { UserListDocumentType } from '../../domain/users/document-types/user-list.document-type';
import type { UserModelType } from '../../domain/users/model-types/user.model-type';
import { User } from '../../domain/users/user.entity';

/*Query-репозиторий для пользователей.*/
@Injectable()
export class UsersQueryRepository {
  public constructor(@InjectModel(User.name) private readonly userModel: UserModelType) {}

  /*Метод для поиска пользователя по ID в БД.*/
  public async findById(id: string): Promise<UserDocumentType | null> {
    /*Просим модель "UserModel" найти пользователя по ID в БД.*/
    return await this.userModel.findOne({ _id: id, deletedAt: null });
  }

  /*Метод для поиска пользователей в БД.*/
  public async findAll(dto: GetUserListQueryInputDTO): Promise<{ items: UserListDocumentType; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();
    /*Динамически собираем фильтр для поиска в MongoDB. В итоге фильтр будет работать так: для получения пользователя
    нужно совпадение хотя бы по одному полю в фильтре, а не по всем сразу.*/
    const conditions: QueryFilter<UserDocumentType>[] = [];
    if (dto.searchLoginTerm) conditions.push({ login: { $regex: dto.searchLoginTerm, $options: 'i' } });
    if (dto.searchEmailTerm) conditions.push({ email: { $regex: dto.searchEmailTerm, $options: 'i' } });
    const filter: QueryFilter<UserDocumentType> = {
      deletedAt: null,
      ...(conditions.length > 0 ? { $or: conditions } : {}),
    };

    /*Просим модель "UserModel" найти пользователей в БД и подсчитать общее количество документов, подходящих под
    фильтр, без учета пагинации.*/
    const [items, totalCount]: [UserListDocumentType, number] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ [dto.sortBy]: dto.sortDirection })
        .skip(skip)
        .limit(dto.pageSize),
      this.userModel.countDocuments(filter),
    ]);

    /*Возвращаем данные по пользователям.*/
    return { items, totalCount };
  }
}
