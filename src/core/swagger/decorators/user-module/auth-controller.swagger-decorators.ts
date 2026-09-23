import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorsMessagesSwaggerType } from '../../../validation/types/errors-messages.type';
import { AuthUserByLoginOrEmailOutputDTO } from '../../../../modules/user/api/auth/output-dto/auth-user-by-login-or-email.output-dto';
import { AuthUserDataOutputDTO } from '../../../../modules/user/api/auth/output-dto/auth-user-data.output-dto';
import { GetNewAccessAndRefreshTokensOutputDTO } from '../../../../modules/user/api/auth/output-dto/get-new-access-and-refresh-tokens.output-dto';

export const AuthControllerSwaggerDecorators = {
  get registerUser() {
    return applyDecorators(
      ApiOperation({ summary: 'Register a user' }),
      ApiNoContentResponse({
        description: 'Creates a user account and sends an email with a code to complete the registration',
      }),
      ApiBadRequestResponse({
        description: 'The input data is invalid or the user already exists',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiTooManyRequestsResponse({ description: 'Too many requests. Not more than 5 requests per 10 seconds' })
    );
  },

  get resendConfirmationEmail() {
    return applyDecorators(
      ApiOperation({ summary: 'Resend a registration confirmation email' }),
      ApiNoContentResponse({ description: 'Resends an email with a code to complete the registration' }),
      ApiBadRequestResponse({
        description: 'The email is invalid, the user has never registered or the user is already registered',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiTooManyRequestsResponse({ description: 'Too many requests. Not more than 5 requests per 10 seconds' })
    );
  },

  get confirmUserByCode() {
    return applyDecorators(
      ApiOperation({ summary: 'Confirm a user registration by confirmation code' }),
      ApiNoContentResponse({ description: 'Confirms the user registration' }),
      ApiBadRequestResponse({
        description:
          'The confirmation code is invalid or expired, the user has never registered or the user is already registered',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiTooManyRequestsResponse({ description: 'Too many requests. Not more than 5 requests per 10 seconds' })
    );
  },

  get sendPasswordRecoveryCode() {
    return applyDecorators(
      ApiOperation({ summary: 'Send a password recovery code' }),
      ApiNoContentResponse({
        description:
          'Sends an email with a password recovery code (even if the user is not registered to prevent email detection)',
      }),
      ApiBadRequestResponse({ description: 'The email is invalid', type: ErrorsMessagesSwaggerType }),
      ApiTooManyRequestsResponse({ description: 'Too many requests. Not more than 5 requests per 10 seconds' })
    );
  },

  get setNewPasswordByPasswordRecoveryCode() {
    return applyDecorators(
      ApiOperation({ summary: 'Set a new password by password recovery code' }),
      ApiNoContentResponse({ description: `Updates the user's password` }),
      ApiBadRequestResponse({
        description:
          'The password recovery code is invalid or expired, the password is invalid or the user does not exist',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiTooManyRequestsResponse({ description: 'Too many requests. Not more than 5 requests per 10 seconds' })
    );
  },

  get authUserByLoginOrEmail() {
    return applyDecorators(
      ApiOperation({ summary: 'Log in a user by login or email' }),
      ApiOkResponse({
        description: 'Sends Access (through body) and Refresh (through cookies) JWTs',
        type: AuthUserByLoginOrEmailOutputDTO,
      }),
      ApiBadRequestResponse({ description: 'The auth credentials are invalid', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'The auth credentials are incorrect',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiTooManyRequestsResponse({ description: 'Too many requests. Not more than 5 requests per 10 seconds' })
    );
  },

  get getNewAccessAndRefreshTokens() {
    return applyDecorators(
      ApiOperation({ summary: 'Get new Access and Refresh JWTs by refresh JWT' }),
      ApiOkResponse({
        description: 'Sends new Access (through body) and Refresh (through cookies) JWTs',
        type: GetNewAccessAndRefreshTokensOutputDTO,
      }),
      ApiUnauthorizedResponse({
        description: 'The refresh JWT is invalid, incorrect or expired',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiCookieAuth('refreshToken')
    );
  },

  get revokeSession() {
    return applyDecorators(
      ApiOperation({ summary: 'Log a user out by Refresh JWT' }),
      ApiNoContentResponse({ description: 'Logs the user out' }),
      ApiUnauthorizedResponse({
        description: 'The refresh JWT is invalid, incorrect or expired',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiCookieAuth('refreshToken')
    );
  },

  get getAuthUserDataByAccessToken() {
    return applyDecorators(
      ApiOperation({ summary: 'Get authenticated user data by Access JWT' }),
      ApiOkResponse({
        description: 'Sends authenticated user data',
        type: AuthUserDataOutputDTO,
      }),
      ApiUnauthorizedResponse({
        description: 'The Access JWT is invalid or the user does not exist',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiBearerAuth()
    );
  },
};
