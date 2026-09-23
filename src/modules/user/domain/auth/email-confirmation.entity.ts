import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/user.validation-constraints';
import { EmailConfirmationDocumentType } from './document-types/email-confirmation.document-type';
import { CreateEmailConfirmationDomainDTO } from './domain-dto/create-email-confirmation.domain-dto';
import { UpdateEmailConfirmationDomainDTO } from './domain-dto/update-email-confirmation.domain-dto';

/*Класс для сущности данных о подтверждении регистрации пользователя.*/
@Schema()
export class EmailConfirmation {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: USER_VALIDATION_CONSTRAINTS.ID.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.ID.MAX_LENGTH,
  })
  public userId: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: USER_VALIDATION_CONSTRAINTS.CONFIRMATION_REGISTRATION_CODE.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.CONFIRMATION_REGISTRATION_CODE.MAX_LENGTH,
  })
  public confirmationCode: string;

  @Prop({ type: Date, required: true })
  public expirationDate: Date;

  /*Метод для создания данных о подтверждении регистрации пользователя.*/
  public static createInstance(dto: CreateEmailConfirmationDomainDTO): EmailConfirmationDocumentType {
    const emailConfirmation = new this();
    emailConfirmation.userId = dto.userId;
    emailConfirmation.confirmationCode = dto.confirmationCode;
    emailConfirmation.expirationDate = dto.expirationDate;
    return emailConfirmation as EmailConfirmationDocumentType;
  }

  /*Метод для изменения данных о подтверждении регистрации пользователя.*/
  public updateInstance(dto: UpdateEmailConfirmationDomainDTO): void {
    this.confirmationCode = dto.confirmationCode;
    this.expirationDate = dto.expirationDate;
  }
}

/*Создаем схему для данных о подтверждении регистрации пользователя на основе класса для сущности данных о подтверждении
регистрации пользователя.*/
export const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);
/*Регистрируем методы класса для сущности данных о подтверждении регистрации пользователя в схеме для данных о
подтверждении регистрации пользователя.*/
EmailConfirmationSchema.loadClass(EmailConfirmation);
