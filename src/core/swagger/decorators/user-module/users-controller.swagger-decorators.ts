import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorsMessagesSwaggerType } from '../../../validation/types/errors-messages.type';
import { UserOutputDTO } from '../../../../modules/user/api/users/output-dto/user.output-dto';
import { PaginatedUserListSwaggerOutputDTO } from './swagger-output-dto/paginated-user-list.swagger-output-dto';

export const UsersControllerSwaggerDecorators = {
  get createUser() {
    return applyDecorators(
      ApiOperation({ summary: 'Create a user' }),
      ApiCreatedResponse({ type: UserOutputDTO, description: 'Returns the created user' }),
      ApiBadRequestResponse({
        description: 'The input data is invalid or the user already exists',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiUnauthorizedResponse({
        description: 'Wrong authorization type or the basic auth credentials are incorrect',
        type: ErrorsMessagesSwaggerType,
      })
    );
  },

  get getUserList() {
    return applyDecorators(
      ApiOperation({ summary: 'Get a paginated list of users' }),
      ApiOkResponse({
        description: 'Returns a paginated list of users',
        type: PaginatedUserListSwaggerOutputDTO,
      }),
      ApiUnauthorizedResponse({
        description: 'Wrong authorization type or the basic auth credentials are incorrect',
        type: ErrorsMessagesSwaggerType,
      })
    );
  },

  get deleteUserById() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete a user by ID' }),
      ApiNoContentResponse({ description: 'Deletes the user' }),
      ApiNotFoundResponse({ description: 'The user does not exist', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'Wrong authorization type or the basic auth credentials are incorrect',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiParam({ name: 'id', description: 'User ID', format: 'ObjectId' })
    );
  },
};
