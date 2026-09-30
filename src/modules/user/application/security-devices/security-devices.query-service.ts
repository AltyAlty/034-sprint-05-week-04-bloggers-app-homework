import { Injectable } from '@nestjs/common';
import { SecurityDevicesQueryRepository } from '../../infrastructure/security-devices/security-devices.query-repository';
import { SecurityDeviceListDb } from '../../infrastructure/security-devices/types/security-device-db.type';
import {
  SecurityDeviceListOutputDTO,
  SecurityDeviceOutputDTO,
} from '../../api/security-devices/output-dto/security-device.output-dto';

/*Query-сервис для пользовательских устройств.*/
@Injectable()
export class SecurityDevicesQueryService {
  public constructor(private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository) {}

  /*Метод для поиска пользовательских устройств по ID пользователя.*/
  public async findAllByUserId(userId: string): Promise<SecurityDeviceListOutputDTO> {
    /*Просим query-репозиторий "SecurityDevicesQueryRepository" найти пользовательские устройства в БД.*/
    const securityDevices: SecurityDeviceListDb = await this.securityDevicesQueryRepository.findAllByUserId(userId);
    /*Преобразовываем пользовательские устройства из БД в подготовленные для отправки клиенту пользовательские
    устройства и возвращаем их.*/
    return SecurityDeviceOutputDTO.mapFromSecurityDeviceListDbToSecurityDeviceListOutputDTO(securityDevices);
  }
}
