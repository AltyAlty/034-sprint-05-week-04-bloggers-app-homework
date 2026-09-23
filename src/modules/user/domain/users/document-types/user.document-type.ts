import { HydratedDocument } from 'mongoose';
import { User } from '../user.entity';

/*Тип документа для пользователя.*/
export type UserDocumentType = HydratedDocument<User>;
