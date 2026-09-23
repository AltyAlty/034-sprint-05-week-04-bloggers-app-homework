import { ApiProperty } from '@nestjs/swagger';
import {
  SecurityDeviceListPostgresqlDb,
  SecurityDevicePostgresqlDb,
} from '../../../infrastructure/security-devices/postgresql-types/security-device-postgresql-db.type';
import { SecurityDeviceListOutputDTO } from './security-device-list.output-dto';
import { SecurityDeviceDocumentType } from '../../../domain/security-devices/document-types/security-device.document-type';
import { SecurityDeviceListDocumentType } from '../../../domain/security-devices/document-types/security-device-list.document-type';

/*Output DTO для пользовательского устройства.*/
export class SecurityDeviceOutputDTO {
  @ApiProperty({ example: '198.51.100.42', description: 'User device IP' })
  public ip: string;

  @ApiProperty({ example: 'securityDeviceTitle', description: 'User device title' })
  public title: string;

  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'Last active date' })
  public lastActiveDate: Date;

  @ApiProperty({ example: '60d5ec386f6e5a1b3c9d4e2a', description: 'User device ID' })
  public deviceId: string;

  /*Маппер для преобразования пользовательского устройства из БД в подготовленное для отправки клиенту пользовательское
  устройство.*/
  public static mapFromSecurityDeviceDocumentTypeToSecurityDeviceOutputDTO(
    securityDevice: SecurityDeviceDocumentType
  ): SecurityDeviceOutputDTO {
    const securityDeviceOutputDTO: SecurityDeviceOutputDTO = new SecurityDeviceOutputDTO();
    securityDeviceOutputDTO.ip = securityDevice.ip;
    securityDeviceOutputDTO.title = securityDevice.title;
    securityDeviceOutputDTO.lastActiveDate = securityDevice.lastActiveDate;
    securityDeviceOutputDTO.deviceId = securityDevice.deviceId;
    return securityDeviceOutputDTO;
  }

  /*Маппер для преобразования блогов из БД в подготовленные для отправки клиенту блоги.*/
  public static mapFromSecurityDeviceListDocumentTypeToSecurityDeviceListOutputDTO(
    securityDevices: SecurityDeviceListDocumentType
  ): SecurityDeviceListOutputDTO {
    return securityDevices.map((securityDevice: SecurityDeviceDocumentType) => {
      return this.mapFromSecurityDeviceDocumentTypeToSecurityDeviceOutputDTO(securityDevice);
    });
  }

  /*Маппер для преобразования пользовательского устройства из БД в подготовленное для отправки клиенту пользовательское
  устройство.*/
  public static mapFromSecurityDevicePostgresqlDbToSecurityDeviceOutputDTO(
    securityDevice: SecurityDevicePostgresqlDb
  ): SecurityDeviceOutputDTO {
    const securityDeviceOutputDTO: SecurityDeviceOutputDTO = new SecurityDeviceOutputDTO();
    securityDeviceOutputDTO.ip = securityDevice.ip;
    securityDeviceOutputDTO.title = securityDevice.title;
    securityDeviceOutputDTO.lastActiveDate = securityDevice.last_active_date;
    securityDeviceOutputDTO.deviceId = securityDevice.device_id;
    return securityDeviceOutputDTO;
  }

  /*Маппер для преобразования блогов из БД в подготовленные для отправки клиенту блоги.*/
  public static mapFromSecurityDeviceListPostgresqlDbToSecurityDeviceListOutputDTO(
    securityDevices: SecurityDeviceListPostgresqlDb
  ): SecurityDeviceListOutputDTO {
    return securityDevices.map((securityDevice: SecurityDevicePostgresqlDb) => {
      return this.mapFromSecurityDevicePostgresqlDbToSecurityDeviceOutputDTO(securityDevice);
    });
  }
}
