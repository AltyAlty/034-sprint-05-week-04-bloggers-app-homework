import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { SECURITY_DEVICE_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/security-device.validation-constraints';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/user.validation-constraints';
import { SessionDocumentType } from './document-types/session.document-type';
import { CreateSessionDomainDTO } from './domain-dto/create-session.domain-dto';
import { UpdateSessionDomainDTO } from './domain-dto/update-session.domain-dto';

/*Класс для пользовательской сессии.*/
@Schema({ timestamps: true })
export class Session {
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
    minlength: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.ID.MIN_LENGTH,
    maxlength: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.ID.MAX_LENGTH,
  })
  public deviceId: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.TITLE.MIN_LENGTH,
    maxlength: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.TITLE.MAX_LENGTH,
  })
  public deviceName: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.IP.MIN_LENGTH,
    maxlength: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.IP.MAX_LENGTH,
  })
  public ip: string;

  @Prop({ type: Date, required: true })
  public iat: Date;

  @Prop({ type: Date, required: true })
  public exp: Date;

  public createdAt: Date;
  public updatedAt: Date;

  @Prop({ type: Date, default: null })
  public deletedAt: Date | null;

  /*Виртуальное свойство для получения ID пользовательской сессии.*/
  public get id(): string {
    return (this as unknown as SessionDocumentType)._id.toString();
  }

  /*Метод для создания пользовательской сессии.*/
  public static createInstance(dto: CreateSessionDomainDTO): SessionDocumentType {
    const session = new this();
    session.userId = dto.userId;
    session.deviceId = dto.deviceId;
    session.deviceName = dto.deviceName;
    session.ip = dto.ip;
    session.iat = dto.iat;
    session.exp = dto.exp;
    return session as SessionDocumentType;
  }

  /*Метод для изменения пользовательской сессии.*/
  public update(dto: UpdateSessionDomainDTO): void {
    this.deviceName = dto.deviceName;
    this.ip = dto.ip;
    this.iat = dto.iat;
    this.exp = dto.exp;
  }

  /*Метод для soft удаления пользовательской сессии.*/
  public markAsDeleted(): void {
    if (this.deletedAt !== null)
      throw new DomainException({
        code: DomainExceptionCode.SessionAlreadyMarkedAsDeleted,
        message: 'Session is already marked as deleted',
        field: '',
      });

    this.deletedAt = new Date();
  }
}

/*Создаем схему для пользовательской сессии на основе класса для сущности пользовательской сессии.*/
export const SessionSchema = SchemaFactory.createForClass(Session);
/*Регистрируем методы класса для сущности пользовательской сессии в схеме для пользовательской сессии.*/
SessionSchema.loadClass(Session);
