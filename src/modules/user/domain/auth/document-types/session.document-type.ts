import { HydratedDocument } from 'mongoose';
import { Session } from '../session.entity';

/*Тип документа для пользовательской сессии.*/
export type SessionDocumentType = HydratedDocument<Session>;
