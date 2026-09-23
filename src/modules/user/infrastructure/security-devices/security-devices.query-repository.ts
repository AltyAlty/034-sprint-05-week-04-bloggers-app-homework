import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SecurityDeviceListDocumentType } from '../../domain/security-devices/document-types/security-device-list.document-type';
import type { SecurityDeviceModelType } from '../../domain/security-devices/model-types/security-device.model-type';
import { SecurityDevice } from '../../domain/security-devices/security-device.entity';

/*Query-репозиторий для пользовательских устройств.*/
@Injectable()
export class SecurityDevicesQueryRepository {
  public constructor(@InjectModel(SecurityDevice.name) private readonly securityDeviceModel: SecurityDeviceModelType) {}

  /*Метод для поиска пользовательских устройств по ID пользователя в БД.*/
  public async findAllByUserId(userId: string): Promise<SecurityDeviceListDocumentType> {
    /*Просим модель "SecurityDeviceModel" найти пользовательские устройства по ID пользователя в БД.*/
    return await this.securityDeviceModel.find({ userId, deletedAt: null });
  }
}
