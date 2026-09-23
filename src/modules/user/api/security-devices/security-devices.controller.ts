import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthPostgresqlService } from '../../application/auth/auth-postgresql.service';
import { SecurityDevicesPostgresqlQueryService } from '../../application/security-devices/security-devices-postgresql.query-service';
import { SecurityDeviceListOutputDTO } from './output-dto/security-device-list.output-dto';
import { UserRefreshJwtAuthContextDTO } from '../../../../core/guards/refresh-jwt-auth/dto/user-refresh-jwt-auth-context.dto';
import { RefreshJwtAuthGuard } from '../../../../core/guards/refresh-jwt-auth/refresh-jwt-auth.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { SecurityDevicesControllerSwaggerDecorators } from '../../../../core/swagger/decorators/user-module/security-devices-controller.swagger-decorators';
import { ExtractUserDataFromRequest } from '../auth/decorators/param-extraction/extract-user-data-from-request.param-decorator';

/*Контроллер для пользовательских устройств.*/
@ApiTags(SETTINGS.SECURITY_DEVICES_API_TAG)
@Controller(SETTINGS.SECURITY_DEVICES_PREFIX)
export class SecurityDevicesController {
  public constructor(
    private readonly authService: AuthPostgresqlService,
    private readonly securityDevicesQueryService: SecurityDevicesPostgresqlQueryService
  ) {}

  /*001. GET-запрос по получению пользовательских устройств.*/
  @SecurityDevicesControllerSwaggerDecorators.getSecurityDeviceList
  @UseGuards(RefreshJwtAuthGuard)
  @Get(SETTINGS.SECURITY_DEVICES_GET_SECURITY_DEVICE_LIST_PATH)
  @HttpCode(HttpStatus.OK)
  public getSecurityDeviceList(
    @ExtractUserDataFromRequest() userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO
  ): Promise<SecurityDeviceListOutputDTO> {
    /*Просим query-сервис "SecurityQueryDevicesService" найти пользовательские устройства по ID пользователя.*/
    return this.securityDevicesQueryService.findAllByUserId(userRefreshJwtAuthContext.id);
  }

  /*002. DELETE-запрос по отзыву пользовательской сессии по ID пользовательского устройства, используя URI-параметры.*/
  @SecurityDevicesControllerSwaggerDecorators.revokeSessionBySecurityDeviceId
  @UseGuards(RefreshJwtAuthGuard)
  @Delete(SETTINGS.SECURITY_DEVICES_REVOKE_SESSION_BY_DEVICE_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async revokeSessionBySecurityDeviceId(
    @Param('id') id: string,
    @ExtractUserDataFromRequest() userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO
  ): Promise<void> {
    /*Просим сервис "authService" отозвать пользовательскую сессию по ID пользовательского устройства.*/
    await this.authService.revokeSessionBySecurityDeviceId(id, userRefreshJwtAuthContext);
  }

  /*003. DELETE-запрос по отзыву всех пользовательских сессий, кроме текущей.*/
  @SecurityDevicesControllerSwaggerDecorators.revokeAllSessionsExceptCurrentOne
  @UseGuards(RefreshJwtAuthGuard)
  @Delete(SETTINGS.SECURITY_DEVICES_REVOKE_ALL_SESSIONS_EXCEPT_CURRENT_ONE_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async revokeAllSessionsExceptCurrentOne(
    @ExtractUserDataFromRequest() userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO
  ): Promise<void> {
    /*Просим сервис "authService" отозвать все пользовательские сессии, кроме текущей.*/
    await this.authService.revokeAllSessionsExceptCurrentOne(userRefreshJwtAuthContext);
  }
}
