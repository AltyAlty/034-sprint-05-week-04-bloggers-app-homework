import { Injectable } from '@nestjs/common';
import { SecurityDevicesPostgresqlQueryRepository } from '../../infrastructure/security-devices/security-devices-postgresql.query-repository';
import { SecurityDeviceListPostgresqlDb } from '../../infrastructure/security-devices/postgresql-types/security-device-postgresql-db.type';
import { SecurityDeviceOutputDTO } from '../../api/security-devices/output-dto/security-device.output-dto';
import { SecurityDeviceListOutputDTO } from '../../api/security-devices/output-dto/security-device-list.output-dto';

/*Query-сервис для пользовательских устройств.*/
@Injectable()
export class SecurityDevicesPostgresqlQueryService {
  public constructor(private readonly securityDevicesQueryRepository: SecurityDevicesPostgresqlQueryRepository) {}

  /*Метод для поиска пользовательских устройств по ID пользователя.*/
  public async findAllByUserId(userId: string): Promise<SecurityDeviceListOutputDTO> {
    /*Просим query-репозиторий "SecurityDevicesQueryRepository" найти пользовательские устройства в БД.*/
    const securityDevices: SecurityDeviceListPostgresqlDb =
      await this.securityDevicesQueryRepository.findAllByUserId(userId);

    /*Преобразовываем пользовательские устройства из БД в подготовленные для отправки клиенту пользовательские
    устройства и возвращаем их.*/
    return SecurityDeviceOutputDTO.mapFromSecurityDeviceListPostgresqlDbToSecurityDeviceListOutputDTO(securityDevices);
  }
}
