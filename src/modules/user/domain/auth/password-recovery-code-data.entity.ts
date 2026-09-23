import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/user.validation-constraints';
import { PasswordRecoveryCodeDataDocumentType } from './document-types/password-recovery-code-data.document-type';
import { CreatePasswordRecoveryCodeDataDomainDTO } from './domain-dto/create-password-recovery-code-data.domain-dto';
import { UpdatePasswordRecoveryCodeDataDomainDTO } from './domain-dto/update-password-recovery-code-data.domain-dto';

/*Класс для сущности данных о коде восстановления пароля пользователя.*/
@Schema()
export class PasswordRecoveryCodeData {
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
    minlength: USER_VALIDATION_CONSTRAINTS.PASSWORD_RECOVERY_CODE.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.PASSWORD_RECOVERY_CODE.MAX_LENGTH,
  })
  public passwordRecoveryCode: string;

  @Prop({ type: Date, required: true })
  public expirationDate: Date;

  /*Метод для создания данных о коде восстановления пароля пользователя.*/
  public static createInstance(dto: CreatePasswordRecoveryCodeDataDomainDTO): PasswordRecoveryCodeDataDocumentType {
    const recoveryCodeData = new this();
    recoveryCodeData.userId = dto.userId;
    recoveryCodeData.passwordRecoveryCode = dto.passwordRecoveryCode;
    recoveryCodeData.expirationDate = dto.expirationDate;
    return recoveryCodeData as PasswordRecoveryCodeDataDocumentType;
  }

  /*Метод для изменения данных о коде восстановления пароля пользователя.*/
  public updateInstance(dto: UpdatePasswordRecoveryCodeDataDomainDTO): void {
    this.passwordRecoveryCode = dto.passwordRecoveryCode;
    this.expirationDate = dto.expirationDate;
  }
}

/*Создаем схему для данных о коде восстановления пароля пользователя на основе класса для сущности данных о коде
восстановления пароля пользователя.*/
export const PasswordRecoveryCodeDataSchema = SchemaFactory.createForClass(PasswordRecoveryCodeData);
/*Регистрируем методы класса для сущности данных о коде восстановления пароля пользователя в схеме для данных о коде
восстановления пароля пользователя.*/
PasswordRecoveryCodeDataSchema.loadClass(PasswordRecoveryCodeData);
