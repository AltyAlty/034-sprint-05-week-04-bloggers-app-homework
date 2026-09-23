import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { normalizeEmail } from '../../../../core/utils/email/normalize-email.util';
import { UserDocumentType } from '../../domain/users/document-types/user.document-type';
import type { UserModelType } from '../../domain/users/model-types/user.model-type';
import { User } from '../../domain/users/user.entity';

/*Репозиторий для пользователей.*/
@Injectable()
export class UsersRepository {
  public constructor(@InjectModel(User.name) private readonly userModel: UserModelType) {}

  /*Метод для сохранения пользователя в БД.*/
  public async save(user: UserDocumentType): Promise<void> {
    await user.save();
  }

  /*Метод для поиска пользователя по ID в БД.*/
  public async findById(id: string): Promise<UserDocumentType | null> {
    /*Просим модель "UserModel" найти пользователя по ID в БД.*/
    return await this.userModel.findOne({ _id: id, deletedAt: null });
  }

  /*Метод для поиска пользователя по логину в БД.*/
  public async findByLogin(login: string): Promise<UserDocumentType | null> {
    /*Просим модель "UserModel" найти пользователя по логину в БД.*/
    return await this.userModel.findOne({ login, deletedAt: null });
  }

  /*Метод для поиска пользователя по email в БД.*/
  public async findByEmail(email: string): Promise<UserDocumentType | null> {
    /*Просим модель "UserModel" найти пользователя по email в БД.*/
    return await this.userModel.findOne({ email: normalizeEmail(email), deletedAt: null });
  }

  /*Метод для поиска пользователя по логину или email в БД.*/
  public async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocumentType | null> {
    /*Просим модель "UserModel" найти пользователя по логину или email в БД.*/
    return await this.userModel.findOne({
      $or: [{ email: normalizeEmail(loginOrEmail) }, { login: loginOrEmail }],
      deletedAt: null,
    });
  }

  /*Метод для hard удаления пользователя по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим модель "UserModel" удалить пользователя по ID в БД.*/
    await this.userModel.deleteOne({ _id: id });
  }
}
