import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { normalizeEmail } from '../../../../core/utils/email/normalize-email.util';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/user.validation-constraints';
import { UserDocumentType } from './document-types/user.document-type';
import { CreateUserDomainDTO } from './domain-dto/create-user.domain-dto';
import { UpdateUserPasswordHashDomainDTO } from './domain-dto/update-user-password-hash.domain-dto';

/*Класс для сущности пользователя.*/
@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: USER_VALIDATION_CONSTRAINTS.LOGIN.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.LOGIN.MAX_LENGTH,
  })
  public login: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: USER_VALIDATION_CONSTRAINTS.EMAIL.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.EMAIL.MAX_LENGTH,
  })
  public originalEmail: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: USER_VALIDATION_CONSTRAINTS.EMAIL.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.EMAIL.MAX_LENGTH,
  })
  public email: string;

  @Prop({
    type: String,
    required: true,
    minlength: USER_VALIDATION_CONSTRAINTS.PASSWORD_HASH.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.PASSWORD_HASH.MAX_LENGTH,
  })
  public passwordHash: string;

  @Prop({ type: Boolean, default: false })
  public isConfirmed: boolean;

  public createdAt: Date;
  public updatedAt: Date;

  @Prop({ type: Date, default: null })
  public deletedAt: Date | null;

  /*Виртуальное свойство для получения ID пользователя.*/
  public get id(): string {
    return (this as unknown as UserDocumentType)._id.toString();
  }

  /*Метод для создания пользователя.*/
  public static createInstance(dto: CreateUserDomainDTO, isConfirmed?: boolean): UserDocumentType {
    const user = new this();
    user.login = dto.login;
    user.originalEmail = dto.email;
    user.email = normalizeEmail(dto.email);
    user.passwordHash = dto.passwordHash;
    if (isConfirmed) user.isConfirmed = isConfirmed;
    return user as UserDocumentType;
  }

  /*Метод для подтверждения регистрации пользователя.*/
  public confirmUser(): void {
    this.isConfirmed = true;
  }

  /*Метод для изменения хеша для пароля пользователя.*/
  public updateUserPasswordHash(dto: UpdateUserPasswordHashDomainDTO): void {
    this.passwordHash = dto.passwordHash;
  }

  /*Метод для soft удаления пользователя.*/
  public markAsDeleted(): void {
    if (this.deletedAt !== null)
      throw new DomainException({
        code: DomainExceptionCode.UserAlreadyMarkedAsDeleted,
        message: 'User is already marked as deleted',
        field: '',
      });

    this.deletedAt = new Date();
  }
}

/*Создаем схему для пользователя на основе класса для сущности пользователя.*/
export const UserSchema = SchemaFactory.createForClass(User);
/*Регистрируем методы класса для сущности пользователя в схеме для пользователя.*/
UserSchema.loadClass(User);
