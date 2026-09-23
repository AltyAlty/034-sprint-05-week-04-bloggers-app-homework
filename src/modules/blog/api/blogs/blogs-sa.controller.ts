import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BlogsPostgresqlService } from '../../application/blogs/blogs-postgresql.service';
import { PostsPostgresqlService } from '../../application/posts/posts-postgresql.service';
import { BlogsPostgresqlQueryService } from '../../application/blogs/blogs-postgresql.query-service';
import { PostsPostgresqlQueryService } from '../../application/posts/posts-postgresql.query-service';
import { CreateBlogInputDTO } from './input-dto/create-blog.input-dto';
import { CreatePostForBlogInputDTO } from './input-dto/create-post-for-blog.input-dto';
import { GetBlogListQueryInputDTO } from './input-dto/query/get-blog-list-query.input-dto';
import { GetPostListByBlogIdQueryInputDTO } from './input-dto/query/get-post-list-by-blog-id-query.input-dto';
import { UpdateBlogByIdInputDTO } from './input-dto/update-blog-by-id.input-dto';
import { UpdatePostByBlogIdAndPostIdInputDTO } from './input-dto/update-post-by-blog-id-and-post-id.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { PostOutputDTO } from '../posts/output-dto/post.output-dto';
import { PostListOutputDTO } from '../posts/output-dto/post-list.output-dto';
import { BlogOutputDTO } from './output-dto/blog.output-dto';
import { BlogListOutputDTO } from './output-dto/blog-list.output-dto';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth/basic-auth.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { BlogsControllerSwaggerDecorators } from '../../../../core/swagger/decorators/blog-module/blogs-controller.swagger-decorators';
import { PostsControllerSwaggerDecorators } from '../../../../core/swagger/decorators/blog-module/posts-controller.swagger-decorators';
import { ExtractUserDataFromRequest } from '../../../user/api/auth/decorators/param-extraction/extract-user-data-from-request.param-decorator';

/*SA-контроллер для блогов.*/
@ApiTags(SETTINGS.BLOGS_API_TAG)
@Controller(SETTINGS.BLOGS_SA_REFIX)
export class BlogsSAController {
  public constructor(
    private readonly blogsService: BlogsPostgresqlService,
    private readonly blogsQueryService: BlogsPostgresqlQueryService,
    private readonly postsService: PostsPostgresqlService,
    private readonly postsQueryService: PostsPostgresqlQueryService
  ) {}

  /*001. POST-запрос по созданию блога.*/
  @BlogsControllerSwaggerDecorators.createBlog
  @UseGuards(BasicAuthGuard)
  @Post(SETTINGS.BLOGS_SA_CREATE_BLOG_PATH)
  @HttpCode(HttpStatus.CREATED)
  public async createBlog(@Body() body: CreateBlogInputDTO): Promise<BlogOutputDTO> {
    /*Просим сервис "BlogsService" создать блог.*/
    return this.blogsService.create(body);
  }

  /*002. POST-запрос по созданию поста в блоге.*/
  @BlogsControllerSwaggerDecorators.createPostForBlog
  @UseGuards(BasicAuthGuard)
  @Post(SETTINGS.BLOGS_SA_CREATE_POST_FOR_BLOG_PATH)
  @HttpCode(HttpStatus.CREATED)
  public async createPostForBlog(
    @Param('blogId') id: string,
    @Body() body: CreatePostForBlogInputDTO
  ): Promise<PostOutputDTO> {
    /*Просим сервис "PostsService" создать пост в блоге.*/
    return this.postsService.createForBlog(body, id);
  }

  /*003. GET-запрос по поиску блогов с пагинацией, используя query-параметры.*/
  @BlogsControllerSwaggerDecorators.getBlogList
  @UseGuards(BasicAuthGuard)
  @Get(SETTINGS.BLOGS_SA_GET_BLOG_LIST_PATH)
  @HttpCode(HttpStatus.OK)
  public async getBlogList(
    @Query() query: GetBlogListQueryInputDTO
  ): Promise<PaginationMetaDataOutputDTO<BlogListOutputDTO>> {
    /*Просим query-сервис "BlogsQueryService" найти блоги.*/
    return this.blogsQueryService.findAll(query);
  }

  /*004. GET-запрос по поиску постов с пагинацией по ID блога, используя query-параметры.*/
  @BlogsControllerSwaggerDecorators.getPostListByBlogId
  @UseGuards(BasicAuthGuard)
  @Get(SETTINGS.BLOGS_SA_GET_POST_LIST_BY_BLOG_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getPostListByBlogId(
    @Param('blogId') id: string,
    @Query() query: GetPostListByBlogIdQueryInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<PaginationMetaDataOutputDTO<PostListOutputDTO>> {
    /*Просим query-сервис "PostsQueryService" найти посты по ID блога.*/
    return this.postsQueryService.findAll(query, id, userAccessJwtAuthContext?.id);
  }

  /*005. PUT-запрос по изменению блога по ID, используя URI-параметры.*/
  @BlogsControllerSwaggerDecorators.updateBlogById
  @UseGuards(BasicAuthGuard)
  @Put(SETTINGS.BLOGS_SA_UPDATE_BLOG_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateBlogById(@Param('id') id: string, @Body() body: UpdateBlogByIdInputDTO): Promise<void> {
    /*Просим сервис "BlogsService" изменить блог по ID.*/
    await this.blogsService.updateById(id, body);
  }

  /*006. PUT-запрос по изменению поста по ID блога и ID поста, используя URI-параметры.*/
  @PostsControllerSwaggerDecorators.updatePostById
  @UseGuards(BasicAuthGuard)
  @Put(SETTINGS.BLOGS_SA_UPDATE_POST_BY_BLOG_ID_AND_POST_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updatePostByBlogIdAndPostId(
    @Param('id') id: string,
    @Param('blogId') blogId: string,
    @Body() body: UpdatePostByBlogIdAndPostIdInputDTO
  ): Promise<void> {
    /*Просим сервис "PostsService" изменить пост по ID.*/
    await this.postsService.updateById(id, { ...body, blogId });
  }

  /*007. DELETE-запрос по удалению блога по ID, используя URI-параметры.*/
  @BlogsControllerSwaggerDecorators.deleteBlogById
  @UseGuards(BasicAuthGuard)
  @Delete(SETTINGS.BLOGS_SA_DELETE_BLOG_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteBlogById(@Param('id') id: string): Promise<void> {
    /*Просим сервис "BlogsService" удалить блог по ID.*/
    await this.blogsService.deleteById(id);
  }

  /*008. DELETE-запрос по удалению поста по ID, используя URI-параметры.*/
  @PostsControllerSwaggerDecorators.deletePostById
  @UseGuards(BasicAuthGuard)
  @Delete(SETTINGS.DELETE_POST_BY_ID_SA_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deletePostById(@Param('id') id: string, @Param('blogId') blogId: string): Promise<void> {
    /*Просим сервис "PostsService" удалить пост по ID.*/
    await this.postsService.deleteById(id, blogId);
  }
}
