import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorsMessagesSwaggerType } from '../../../validation/types/errors-messages.type';
import { SecurityDeviceOutputDTO } from '../../../../modules/user/api/security-devices/output-dto/security-device.output-dto';

export const SecurityDevicesControllerSwaggerDecorators = {
  get getSecurityDeviceList() {
    return applyDecorators(
      ApiOperation({ summary: `Get a user's devices` }),
      ApiOkResponse({
        description: `Returns a list of a user's devices`,
        type: [SecurityDeviceOutputDTO],
      }),
      ApiUnauthorizedResponse({
        description: 'The refresh JWT is invalid, incorrect or expired',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiCookieAuth('refreshToken')
    );
  },

  get revokeSessionBySecurityDeviceId() {
    return applyDecorators(
      ApiOperation({ summary: 'Revoke a session by user device ID' }),
      ApiNoContentResponse({ description: 'Revokes the session' }),
      ApiUnauthorizedResponse({
        description: 'The refresh JWT is invalid, incorrect or expired',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiForbiddenResponse({ description: 'The user is not the owner of the device', type: ErrorsMessagesSwaggerType }),
      ApiNotFoundResponse({ description: 'The device does not exist', type: ErrorsMessagesSwaggerType }),
      ApiCookieAuth('refreshToken'),
      ApiParam({ name: 'id', description: 'User device ID', format: 'ObjectId' })
    );
  },

  get revokeAllSessionsExceptCurrentOne() {
    return applyDecorators(
      ApiOperation({ summary: 'Revoke all sessions except the current one' }),
      ApiNoContentResponse({ description: 'Revokes all sessions except the current one' }),
      ApiUnauthorizedResponse({
        description: 'The refresh JWT is invalid, incorrect or expired',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiCookieAuth('refreshToken')
    );
  },
};
