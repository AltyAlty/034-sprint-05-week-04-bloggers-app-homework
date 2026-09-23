import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
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
  get createPost() {
    return applyDecorators(
      ApiOperation({ summary: 'Create a post' }),
      ApiCreatedResponse({ description: 'Returns the created post', type: PostOutputDTO }),
      ApiBadRequestResponse({ description: 'The input data is invalid', type: ErrorsMessagesSwaggerType }),
      ApiNotFoundResponse({ description: 'The blog does not exist', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'Wrong authorization type or the basic auth credentials are incorrect',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiBasicAuth()
    );
  },

  get createCommentForPost() {
    return applyDecorators(
      ApiOperation({ summary: 'Create a comment for a post' }),
      ApiCreatedResponse({ description: 'Returns the created comment', type: CommentOutputDTO }),
      ApiBadRequestResponse({ description: 'The input data is invalid', type: ErrorsMessagesSwaggerType }),
      ApiNotFoundResponse({ description: 'The post does not exist', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'The Access JWT is invalid or the user does not exist',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiBearerAuth()
    );
  },

  get getPostById() {
    return applyDecorators(
      ApiOperation({ summary: 'Get a post by ID. Bearer auth is optional to get personalized like status' }),
      ApiOkResponse({ description: 'Returns the post', type: PostOutputDTO }),
      ApiNotFoundResponse({ description: 'The post does not exist', type: ErrorsMessagesSwaggerType }),
      ApiBearerAuth(),
      ApiParam({ name: 'id', description: 'Post ID', format: 'ObjectId' })
    );
  },

  get getPostList() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get a paginated list of posts. Bearer auth is optional to get personalized like statuses',
      }),
      ApiOkResponse({ description: 'Returns a paginated list of posts', type: PaginatedPostListSwaggerOutputDTO }),
      ApiNotFoundResponse({ description: 'The blog does not exist', type: ErrorsMessagesSwaggerType }),
      ApiBearerAuth()
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
      ApiBearerAuth(),
      ApiParam({ name: 'postId', description: 'Post ID', format: 'ObjectId' })
    );
  },

  get updatePostById() {
    return applyDecorators(
      ApiOperation({ summary: 'Update a post by ID' }),
      ApiNoContentResponse({ description: 'Updates the post' }),
      ApiBadRequestResponse({ description: 'The input data is invalid', type: ErrorsMessagesSwaggerType }),
      ApiNotFoundResponse({ description: 'The post does not exist', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'Wrong authorization type or the basic auth credentials are incorrect',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiBasicAuth(),
      ApiParam({ name: 'id', description: 'Post ID', format: 'ObjectId' })
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
      ApiBearerAuth(),
      ApiParam({ name: 'id', description: 'Post ID', format: 'ObjectId' })
    );
  },

  get deletePostById() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete a post by ID' }),
      ApiNoContentResponse({ description: 'Deletes the post' }),
      ApiNotFoundResponse({ description: 'The post does not exist', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'Wrong authorization type or the basic auth credentials are incorrect',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiParam({ name: 'id', description: 'Post ID', format: 'ObjectId' }),
      ApiBasicAuth()
    );
  },
};
