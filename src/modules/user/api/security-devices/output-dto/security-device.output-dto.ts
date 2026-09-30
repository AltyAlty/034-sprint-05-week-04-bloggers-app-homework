import { ApiProperty } from '@nestjs/swagger';
import {
  SecurityDeviceDb,
  SecurityDeviceListDb,
} from '../../../infrastructure/security-devices/types/security-device-db.type';

/*Output DTO для пользовательского устройства.*/
export class SecurityDeviceOutputDTO {
  @ApiProperty({ example: '198.51.100.42', description: 'User device IP' })
  public ip: string;

  @ApiProperty({ example: 'securityDeviceTitle', description: 'User device title' })
  public title: string;

  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'Last active date' })
  public lastActiveDate: Date;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User device ID' })
  public deviceId: string;

  /*Маппер для преобразования пользовательского устройства из БД в подготовленное для отправки клиенту пользовательское
  устройство.*/
  public static mapFromSecurityDeviceDbToSecurityDeviceOutputDTO(
    securityDevice: SecurityDeviceDb
  ): SecurityDeviceOutputDTO {
    const securityDeviceOutputDTO: SecurityDeviceOutputDTO = new SecurityDeviceOutputDTO();
    securityDeviceOutputDTO.ip = securityDevice.ip;
    securityDeviceOutputDTO.title = securityDevice.title;
    securityDeviceOutputDTO.lastActiveDate = securityDevice.last_active_date;
    securityDeviceOutputDTO.deviceId = securityDevice.device_id;
    return securityDeviceOutputDTO;
  }

  /*Маппер для преобразования блогов из БД в подготовленные для отправки клиенту блоги.*/
  public static mapFromSecurityDeviceListDbToSecurityDeviceListOutputDTO(
    securityDevices: SecurityDeviceListDb
  ): SecurityDeviceListOutputDTO {
    return securityDevices.map((securityDevice: SecurityDeviceDb) => {
      return this.mapFromSecurityDeviceDbToSecurityDeviceOutputDTO(securityDevice);
    });
  }
}

/*Output DTO для списка пользовательских устройств.*/
export type SecurityDeviceListOutputDTO = SecurityDeviceOutputDTO[];
