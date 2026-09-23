import { Model } from 'mongoose';
import { SessionDocumentType } from '../document-types/session.document-type';
import { Session } from '../session.entity';

/*Тип модели для пользовательской сессии со статическими методами класса для пользовательской сессии.*/
export type SessionModelType = Model<SessionDocumentType> & typeof Session;
