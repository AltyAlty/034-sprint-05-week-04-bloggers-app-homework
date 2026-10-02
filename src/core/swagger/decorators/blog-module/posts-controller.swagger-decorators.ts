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
import { CommentOutputDTO } from '../../../../modules/blog/api/comments/output-dto/comment.output-dto';
import { PostOutputDTO } from '../../../../modules/blog/api/posts/output-dto/post.output-dto';
import { PaginatedCommentListSwaggerOutputDTO } from './swagger-output-dto/paginated-comment-list.swagger-output-dto';
import { PaginatedPostListSwaggerOutputDTO } from './swagger-output-dto/paginated-post-list.swagger-output-dto';

export const PostsControllerSwaggerDecorators = {
  get createCommentForPostByPostId() {
    return applyDecorators(
      ApiOperation({ summary: 'Create a comment for a post' }),
      ApiCreatedResponse({ description: 'Returns the created comment', type: CommentOutputDTO }),
      ApiBadRequestResponse({ description: 'The input data is invalid', type: ErrorsMessagesSwaggerType }),
      ApiNotFoundResponse({ description: 'The post does not exist', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'The Access JWT is invalid or the user does not exist',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiParam({ name: 'id', description: 'Post ID', format: 'uuid' })
    );
  },

  get getPostById() {
    return applyDecorators(
      ApiOperation({ summary: 'Get a post by ID. Bearer auth is optional to get personalized like status' }),
      ApiOkResponse({ description: 'Returns the post', type: PostOutputDTO }),
      ApiNotFoundResponse({ description: 'The post does not exist', type: ErrorsMessagesSwaggerType }),
      ApiParam({ name: 'id', description: 'Post ID', format: 'uuid' })
    );
  },

  get getPostList() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get a paginated list of posts. Bearer auth is optional to get personalized like statuses',
      }),
      ApiOkResponse({ description: 'Returns a paginated list of posts', type: PaginatedPostListSwaggerOutputDTO })
    );
  },

  get getCommentListByPostId() {
    return applyDecorators(
      ApiOperation({
        summary:
          'Get a paginated list of comments by post ID. Bearer auth is optional to get personalized like statuses',
      }),
      ApiOkResponse({
        description: 'Returns a paginated list of comments',
        type: PaginatedCommentListSwaggerOutputDTO,
      }),
      ApiNotFoundResponse({ description: 'The post does not exist', type: ErrorsMessagesSwaggerType }),
      ApiParam({ name: 'id', description: 'Post ID', format: 'uuid' })
    );
  },

  get updatePostLikeStatusById() {
    return applyDecorators(
      ApiOperation({ summary: 'Update a post like status by ID' }),
      ApiNoContentResponse({ description: 'Updates the post like status' }),
      ApiBadRequestResponse({ description: 'The input data is invalid', type: ErrorsMessagesSwaggerType }),
      ApiNotFoundResponse({ description: 'The post does not exist', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'The Access JWT is invalid or the user does not exist',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiParam({ name: 'id', description: 'Post ID', format: 'uuid' })
    );
  },
};
