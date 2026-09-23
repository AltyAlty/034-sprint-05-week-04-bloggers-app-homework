import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SecurityDeviceDocumentType } from '../../domain/security-devices/document-types/security-device.document-type';
import type { SecurityDeviceModelType } from '../../domain/security-devices/model-types/security-device.model-type';
import { SecurityDevice } from '../../domain/security-devices/security-device.entity';

/*Репозиторий для пользовательских устройств.*/
@Injectable()
export class SecurityDevicesRepository {
  public constructor(@InjectModel(SecurityDevice.name) private readonly securityDeviceModel: SecurityDeviceModelType) {}

  /*Метод для сохранения пользовательского устройства в БД.*/
  public async save(session: SecurityDeviceDocumentType): Promise<void> {
    await session.save();
  }

  /*Метод для поиска пользовательского устройства по ID в БД.*/
  public async findById(id: string): Promise<SecurityDeviceDocumentType | null> {
    /*Просим модель "SecurityDeviceModel" найти пользовательское устройство по ID в БД.*/
    return await this.securityDeviceModel.findOne({ deviceId: id, deletedAt: null });
  }

  /*Метод для hard удаления пользовательского устройства по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим модель "SecurityDeviceModel" удалить пользовательское устройство по ID в БД.*/
    await this.securityDeviceModel.deleteOne({ deviceId: id });
  }

  /*Метод для hard удаления всех пользовательских устройств, кроме текущего, по ID пользовательского устройства и ID
  пользователя в БД.*/
  public async deleteAllExceptCurrentOneBySecurityDeviceIdAndUserId(id: string, userId: string): Promise<void> {
    /*Просим модель "SecurityDeviceModel" удалить все пользовательские устройства, кроме текущего, по ID
    пользовательского устройства и ID пользователя в БД.*/
    await this.securityDeviceModel.deleteMany({ userId, deviceId: { $ne: id } });
  }
}
