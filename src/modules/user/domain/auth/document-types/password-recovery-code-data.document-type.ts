import { HydratedDocument } from 'mongoose';
import { PasswordRecoveryCodeData } from '../password-recovery-code-data.entity';

/*Тип документа для данных о коде восстановления пароля пользователя.*/
export type PasswordRecoveryCodeDataDocumentType = HydratedDocument<PasswordRecoveryCodeData>;
