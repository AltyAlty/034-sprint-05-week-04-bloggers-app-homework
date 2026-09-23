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
import { BlogOutputDTO } from '../../../../modules/blog/api/blogs/output-dto/blog.output-dto';
import { PostOutputDTO } from '../../../../modules/blog/api/posts/output-dto/post.output-dto';
import { PaginatedBlogListSwaggerOutputDTO } from './swagger-output-dto/paginated-blog-list.swagger-output-dto';
import { PaginatedPostListSwaggerOutputDTO } from './swagger-output-dto/paginated-post-list.swagger-output-dto';

export const BlogsControllerSwaggerDecorators = {
  get createBlog() {
    return applyDecorators(
      ApiOperation({ summary: 'Create a blog' }),
      ApiCreatedResponse({ description: 'Returns the created blog', type: BlogOutputDTO }),
      ApiBadRequestResponse({ description: 'The input data is invalid', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'Wrong authorization type or the basic auth credentials are incorrect',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiBasicAuth()
    );
  },

  get createPostForBlog() {
    return applyDecorators(
      ApiOperation({ summary: 'Create a post for a blog' }),
      ApiCreatedResponse({ description: 'Returns the created post', type: PostOutputDTO }),
      ApiBadRequestResponse({ description: 'The input data is invalid', type: ErrorsMessagesSwaggerType }),
      ApiNotFoundResponse({ description: 'The blog does not exist', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'Wrong authorization type or the basic auth credentials are incorrect',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiBasicAuth(),
      ApiParam({ name: 'blogId', description: 'Blog ID', format: 'ObjectId' })
    );
  },

  get getBlogById() {
    return applyDecorators(
      ApiOperation({ summary: 'Get a blog by ID' }),
      ApiOkResponse({ type: BlogOutputDTO, description: 'Returns the blog' }),
      ApiNotFoundResponse({ description: 'The blog does not exist', type: ErrorsMessagesSwaggerType }),
      ApiParam({ name: 'id', description: 'Blog ID', format: 'ObjectId' })
    );
  },

  get getBlogList() {
    return applyDecorators(
      ApiOperation({ summary: 'Get a paginated list of blogs' }),
      ApiOkResponse({ description: 'Returns a paginated list of blogs', type: PaginatedBlogListSwaggerOutputDTO })
    );
  },

  get getPostListByBlogId() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get a paginated list of posts by blog ID. Bearer auth is optional to get personalized like statuses',
      }),
      ApiOkResponse({ type: PaginatedPostListSwaggerOutputDTO, description: 'Returns a paginated list of posts' }),
      ApiNotFoundResponse({ description: 'The blog does not exist', type: ErrorsMessagesSwaggerType }),
      ApiBearerAuth(),
      ApiParam({ name: 'blogId', description: 'Blog ID', format: 'ObjectId' })
    );
  },

  get updateBlogById() {
    return applyDecorators(
      ApiOperation({ summary: 'Update a blog by ID' }),
      ApiNoContentResponse({ description: 'Updates the blog' }),
      ApiBadRequestResponse({ description: 'The input data is invalid', type: ErrorsMessagesSwaggerType }),
      ApiNotFoundResponse({ description: 'The blog does not exist', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'Wrong authorization type or the basic auth credentials are incorrect',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiBasicAuth(),
      ApiParam({ name: 'id', description: 'Blog ID', format: 'ObjectId' })
    );
  },

  get deleteBlogById() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete a blog by ID' }),
      ApiNoContentResponse({ description: 'Deletes the blog' }),
      ApiNotFoundResponse({ description: 'The blog does not exist', type: ErrorsMessagesSwaggerType }),
      ApiUnauthorizedResponse({
        description: 'Wrong authorization type or the basic auth credentials are incorrect',
        type: ErrorsMessagesSwaggerType,
      }),
      ApiBasicAuth(),
      ApiParam({ name: 'id', description: 'Blog ID', format: 'ObjectId' })
    );
  },
};
