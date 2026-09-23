import { Model } from 'mongoose';
import { UserDocumentType } from '../document-types/user.document-type';
import { User } from '../user.entity';

/*Тип модели для пользователя со статическими методами класса для сущности пользователя.*/
export type UserModelType = Model<UserDocumentType> & typeof User;
