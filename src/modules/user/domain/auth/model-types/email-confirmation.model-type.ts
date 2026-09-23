import { Model } from 'mongoose';
import { EmailConfirmationDocumentType } from '../document-types/email-confirmation.document-type';
import { EmailConfirmation } from '../email-confirmation.entity';

/*Тип модели для данных о подтверждении регистрации пользователя со статическими методами класса для данных о
подтверждении регистрации пользователя.*/
export type EmailConfirmationModelType = Model<EmailConfirmationDocumentType> & typeof EmailConfirmation;
