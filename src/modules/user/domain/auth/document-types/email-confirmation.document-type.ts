import { HydratedDocument } from 'mongoose';
import { EmailConfirmation } from '../email-confirmation.entity';

/*Тип документа для данных о подтверждении регистрации пользователя.*/
export type EmailConfirmationDocumentType = HydratedDocument<EmailConfirmation>;
