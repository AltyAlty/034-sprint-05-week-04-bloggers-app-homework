import { Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BlogsPostgresqlQueryService } from '../../application/blogs/blogs-postgresql.query-service';
import { PostsPostgresqlQueryService } from '../../application/posts/posts-postgresql.query-service';
import { GetBlogListQueryInputDTO } from './input-dto/query/get-blog-list-query.input-dto';
import { GetPostListByBlogIdQueryInputDTO } from './input-dto/query/get-post-list-by-blog-id-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { PostListOutputDTO } from '../posts/output-dto/post-list.output-dto';
import { BlogOutputDTO } from './output-dto/blog.output-dto';
import { BlogListOutputDTO } from './output-dto/blog-list.output-dto';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { OptionalAccessJwtAuthGuard } from '../../../../core/guards/optional-access-jwt-auth/optional-access-jwt-auth.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { BlogsControllerSwaggerDecorators } from '../../../../core/swagger/decorators/blog-module/blogs-controller.swagger-decorators';
import { ExtractUserDataFromRequest } from '../../../user/api/auth/decorators/param-extraction/extract-user-data-from-request.param-decorator';

/*Контроллер для блогов.*/
@ApiTags(SETTINGS.BLOGS_API_TAG)
@Controller(SETTINGS.BLOGS_PREFIX)
export class BlogsController {
  public constructor(
    private readonly blogsQueryService: BlogsPostgresqlQueryService,
    private readonly postsQueryService: PostsPostgresqlQueryService
  ) {}

  /*001. GET-запрос по поиску блога по ID, используя URI-параметры.*/
  @BlogsControllerSwaggerDecorators.getBlogById
  @Get(SETTINGS.BLOGS_GET_BLOG_BY_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getBlogById(@Param('id') id: string): Promise<BlogOutputDTO> {
    /*Просим query-сервис "BlogsQueryService" найти блог по ID.*/
    return this.blogsQueryService.findById(id);
  }

  /*002. GET-запрос по поиску блогов с пагинацией, используя query-параметры.*/
  @BlogsControllerSwaggerDecorators.getBlogList
  @Get(SETTINGS.BLOGS_GET_BLOG_LIST_PATH)
  @HttpCode(HttpStatus.OK)
  public async getBlogList(
    @Query() query: GetBlogListQueryInputDTO
  ): Promise<PaginationMetaDataOutputDTO<BlogListOutputDTO>> {
    /*Просим query-сервис "BlogsQueryService" найти блоги.*/
    return this.blogsQueryService.findAll(query);
  }

  /*003. GET-запрос по поиску постов с пагинацией по ID блога, используя query-параметры.*/
  @BlogsControllerSwaggerDecorators.getPostListByBlogId
  @UseGuards(OptionalAccessJwtAuthGuard)
  @Get(SETTINGS.BLOGS_GET_POST_LIST_BY_BLOG_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getPostListByBlogId(
    @Param('blogId') id: string,
    @Query() query: GetPostListByBlogIdQueryInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<PaginationMetaDataOutputDTO<PostListOutputDTO>> {
    /*Просим query-сервис "PostsQueryService" найти посты по ID блога.*/
    return this.postsQueryService.findAll(query, id, userAccessJwtAuthContext?.id);
  }
}
