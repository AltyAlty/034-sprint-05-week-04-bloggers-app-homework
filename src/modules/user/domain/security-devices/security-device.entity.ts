import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { SECURITY_DEVICE_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/security-device.validation-constraints';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/user.validation-constraints';
import { SecurityDeviceDocumentType } from './document-types/security-device.document-type';
import { CreateSecurityDeviceDomainDTO } from './domain-dto/create-security-device.domain-dto';
import { UpdateSecurityDeviceDomainDTO } from './domain-dto/update-security-device.domain-dto';

/*Класс для пользовательского устройства.*/
@Schema({ timestamps: true })
export class SecurityDevice {
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
    minlength: USER_VALIDATION_CONSTRAINTS.ID.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.ID.MAX_LENGTH,
  })
  public userId: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.TITLE.MIN_LENGTH,
    maxlength: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.TITLE.MAX_LENGTH,
  })
  public title: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.IP.MIN_LENGTH,
    maxlength: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.IP.MAX_LENGTH,
  })
  public ip: string;

  @Prop({ type: Date, required: true })
  public lastActiveDate: Date;

  public createdAt: Date;
  public updatedAt: Date;

  @Prop({ type: Date, default: null })
  public deletedAt: Date | null;

  /*Виртуальное свойство для получения ID пользовательского устройства.*/
  public get id(): string {
    return (this as unknown as SecurityDeviceDocumentType)._id.toString();
  }

  /*Метод для создания пользовательского устройства.*/
  public static createInstance(dto: CreateSecurityDeviceDomainDTO): SecurityDeviceDocumentType {
    const securityDevice = new this();
    securityDevice.deviceId = dto.deviceId;
    securityDevice.userId = dto.userId;
    securityDevice.title = dto.title;
    securityDevice.ip = dto.ip;
    securityDevice.lastActiveDate = dto.lastActiveDate;
    return securityDevice as SecurityDeviceDocumentType;
  }

  /*Метод для изменения пользовательского устройства.*/
  public update(dto: UpdateSecurityDeviceDomainDTO): void {
    this.title = dto.title;
    this.ip = dto.ip;
    this.lastActiveDate = dto.lastActiveDate;
  }

  /*Метод для soft удаления пользовательского устройства.*/
  public markAsDeleted(): void {
    if (this.deletedAt !== null)
      throw new DomainException({
        code: DomainExceptionCode.SecurityDeviceAlreadyMarkedAsDeleted,
        message: 'Security device is already marked as deleted',
        field: '',
      });

    this.deletedAt = new Date();
  }
}

/*Создаем схему для пользовательского устройства на основе класса для сущности пользовательского устройства.*/
export const SecurityDeviceSchema = SchemaFactory.createForClass(SecurityDevice);
/*Регистрируем методы класса для сущности пользовательского устройства в схеме для пользовательского устройства.*/
SecurityDeviceSchema.loadClass(SecurityDevice);
