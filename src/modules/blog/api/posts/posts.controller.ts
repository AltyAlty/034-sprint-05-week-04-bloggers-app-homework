import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsService } from '../../application/comments/comments.service';
import { PostsService } from '../../application/posts/posts.service';
import { CommentsQueryService } from '../../application/comments/comments.query-service';
import { PostsQueryService } from '../../application/posts/posts.query-service';
import { CreateCommentForPostInputDTO } from './input-dto/create-comment-for-post.input-dto';
import { GetCommentListByPostIdQueryInputDTO } from './input-dto/query/get-comment-list-by-post-id-query.input-dto';
import { GetPostListQueryInputDTO } from './input-dto/query/get-post-list-query.input-dto';
import { UpdatePostLikeStatusByIdInputDTO } from './input-dto/update-post-like-status-by-id.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { CommentListOutputDTO, CommentOutputDTO } from '../comments/output-dto/comment.output-dto';
import { PostListOutputDTO, PostOutputDTO } from './output-dto/post.output-dto';
import { AccessJwtAuthGuard } from '../../../../core/guards/access-jwt-auth/access-jwt-auth.guard';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { OptionalAccessJwtAuthGuard } from '../../../../core/guards/optional-access-jwt-auth/optional-access-jwt-auth.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { PostsControllerSwaggerDecorators } from '../../../../core/swagger/decorators/blog-module/posts-controller.swagger-decorators';
import { ExtractUserDataFromRequest } from '../../../user/api/auth/decorators/param-extraction/extract-user-data-from-request.param-decorator';

/*Контроллер для постов.*/
@ApiTags(SETTINGS.POSTS_API_TAG)
@ApiBearerAuth()
@Controller(SETTINGS.POSTS_PREFIX)
export class PostsController {
  public constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryService: PostsQueryService,
    private readonly commentsService: CommentsService,
    private readonly commentsQueryService: CommentsQueryService
  ) {}

  /*001. POST-запрос по созданию комментария в посте по ID поста, используя URI-параметры.*/
  @PostsControllerSwaggerDecorators.createCommentForPostByPostId
  @UseGuards(AccessJwtAuthGuard)
  @Post(SETTINGS.POSTS_CREATE_COMMENT_FOR_POST_PATH)
  @HttpCode(HttpStatus.CREATED)
  public async createCommentForPostByPostId(
    @Param('id') id: string,
    @Body() body: CreateCommentForPostInputDTO,
    @ExtractUserDataFromRequest() userJwtAccessAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<CommentOutputDTO> {
    /*Просим сервис "CommentsService" создать комментарий в посте.*/
    return this.commentsService.createForPost(id, body, userJwtAccessAuthContext);
  }

  /*002. GET-запрос по поиску поста по ID, используя URI-параметры.*/
  @PostsControllerSwaggerDecorators.getPostById
  @UseGuards(OptionalAccessJwtAuthGuard)
  @Get(SETTINGS.POSTS_GET_POST_BY_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getPostById(
    @Param('id') id: string,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<PostOutputDTO> {
    /*Просим query-сервис "PostsQueryService" найти пост по ID.*/
    return this.postsQueryService.findById(id, userAccessJwtAuthContext?.id);
  }

  /*003. GET-запрос по поиску постов с пагинацией, используя query-параметры.*/
  @PostsControllerSwaggerDecorators.getPostList
  @UseGuards(OptionalAccessJwtAuthGuard)
  @Get(SETTINGS.POSTS_GET_POST_LIST_PATH)
  @HttpCode(HttpStatus.OK)
  public async getPostList(
    @Query() query: GetPostListQueryInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<PaginationMetaDataOutputDTO<PostListOutputDTO>> {
    /*Просим query-сервис "PostsQueryService" найти посты.*/
    return this.postsQueryService.findAll(query, undefined, userAccessJwtAuthContext?.id);
  }

  /*004. GET-запрос по поиску комментариев с пагинацией по ID поста, используя query-параметры.*/
  @PostsControllerSwaggerDecorators.getCommentListByPostId
  @UseGuards(OptionalAccessJwtAuthGuard)
  @Get(SETTINGS.POSTS_GET_COMMENT_LIST_BY_POST_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getCommentListByPostId(
    @Param('id') id: string,
    @Query() query: GetCommentListByPostIdQueryInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<PaginationMetaDataOutputDTO<CommentListOutputDTO>> {
    /*Просим query-сервис "CommentsQueryService" найти комментарии по ID поста.*/
    return this.commentsQueryService.findAllByPostId(id, query, userAccessJwtAuthContext?.id);
  }

  /*005. PUT-запрос по изменению статуса лайка поста по ID поста, используя URI-параметры.*/
  @PostsControllerSwaggerDecorators.updatePostLikeStatusById
  @UseGuards(AccessJwtAuthGuard)
  @Put(SETTINGS.POSTS_LIKE_POST_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updatePostLikeStatusById(
    @Param('id') id: string,
    @Body() body: UpdatePostLikeStatusByIdInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим сервис "PostsService" изменить статус лайка поста по ID поста.*/
    await this.postsService.updatePostLikeStatusById(id, body, userAccessJwtAuthContext);
  }
}
