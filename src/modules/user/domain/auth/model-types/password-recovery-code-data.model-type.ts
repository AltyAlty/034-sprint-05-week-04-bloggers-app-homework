import { Model } from 'mongoose';
import { PasswordRecoveryCodeDataDocumentType } from '../document-types/password-recovery-code-data.document-type';
import { PasswordRecoveryCodeData } from '../password-recovery-code-data.entity';

/*Тип модели для данных о коде восстановления пароля пользователя со статическими методами класса для данных о коде
восстановления пароля пользователя.*/
export type PasswordRecoveryCodeDataModelType = Model<PasswordRecoveryCodeDataDocumentType> &
  typeof PasswordRecoveryCodeData;
