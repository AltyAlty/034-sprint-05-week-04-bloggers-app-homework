import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorsMessagesSwaggerType } from '../../../validation/types/errors-messages.type';
import { CommentOutputDTO } from '../../../../modules/blog/api/comments/output-dto/comment.output-dto';

export const CommentsControllerSwaggerDecorators = {
  get getCommentById() {
    return applyDecorators(
      ApiOperation({ summary: 'Get a comment by ID. Bearer auth is optional to get personalized like status' }),
      ApiOkResponse({ description: 'Returns the comment', type: CommentOutputDTO }),
      ApiNotFoundResponse({ description: 'The comment does not exist', type: ErrorsMessagesSwaggerType }),
      ApiBearerAuth(),
      ApiParam({ name: 'id', description: 'Comment ID', format: 'ObjectId' })
    );
  },

  get updateCommentById() {
    return applyDecorators(
      ApiOperation({ summary: 'Update a comment by ID' }),
      ApiNoContentResponse({ description: 'Updates the comment' }),
      ApiBadRequestResponse({ description: 'The input data is invalid', type: ErrorsMessagesSwaggerType }),
      ApiNotFoundResponse({ description: 'The comment does not exist', type: ErrorsMessagesSwaggerType }),
      ApiForbiddenResponse({
        description: 'The user is not the owner of the comment',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiUnauthorizedResponse({
        description: 'The Access JWT is invalid or the user does not exist',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiBearerAuth(),
      ApiParam({ name: 'id', description: 'Comment ID', format: 'ObjectId' })
    );
  },

  get updateCommentLikeStatusById() {
    return applyDecorators(
      ApiOperation({ summary: 'Update a comment like status by ID' }),
      ApiNoContentResponse({ description: 'Updates the comment like status' }),
      ApiBadRequestResponse({ description: 'The input data is invalid', type: ErrorsMessagesSwaggerType }),
      ApiNotFoundResponse({ description: 'The comment does not exist', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'The Access JWT is invalid or the user does not exist',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiBearerAuth(),
      ApiParam({ name: 'id', description: 'Comment ID', format: 'ObjectId' })
    );
  },

  get deleteCommentById() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete a comment by ID' }),
      ApiNoContentResponse({ description: 'Deletes the comment' }),
      ApiNotFoundResponse({ description: 'The comment does not exist', type: ErrorsMessagesSwaggerType }),
      ApiForbiddenResponse({
        description: 'The user is not the owner of the comment',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiUnauthorizedResponse({
        description: 'The Access JWT is invalid or the user does not exist',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiBearerAuth(),
      ApiParam({ name: 'id', description: 'Comment ID', format: 'ObjectId' })
    );
  },
};
