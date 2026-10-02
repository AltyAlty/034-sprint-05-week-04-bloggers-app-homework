import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ErrorsMessagesSwaggerType } from '../../../validation/types/errors-messages.type';
import { BlogOutputDTO } from '../../../../modules/blog/api/blogs/output-dto/blog.output-dto';
import { PaginatedBlogListSwaggerOutputDTO } from './swagger-output-dto/paginated-blog-list.swagger-output-dto';
import { PaginatedPostListSwaggerOutputDTO } from './swagger-output-dto/paginated-post-list.swagger-output-dto';

export const BlogsControllerSwaggerDecorators = {
  get getBlogById() {
    return applyDecorators(
      ApiOperation({ summary: 'Get a blog by ID' }),
      ApiOkResponse({ type: BlogOutputDTO, description: 'Returns the blog' }),
      ApiNotFoundResponse({ description: 'The blog does not exist', type: ErrorsMessagesSwaggerType }),
      ApiParam({ name: 'id', description: 'Blog ID', format: 'uuid' })
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
      ApiParam({ name: 'id', description: 'Blog ID', format: 'uuid' })
    );
  },
};
