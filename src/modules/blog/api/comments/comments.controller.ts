import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommentsPostgresqlService } from '../../application/comments/comments-postgresql.service';
import { CommentsPostgresqlQueryService } from '../../application/comments/comments-postgresql.query-service';
import { UpdateCommentByIdInputDTO } from './input-dto/update-comment-by-id.input-dto';
import { UpdateCommentLikeStatusByIdInputDTO } from './input-dto/update-comment-like-status-by-id.input-dto';
import { CommentOutputDTO } from './output-dto/comment.output-dto';
import { AccessJwtAuthGuard } from '../../../../core/guards/access-jwt-auth/access-jwt-auth.guard';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { OptionalAccessJwtAuthGuard } from '../../../../core/guards/optional-access-jwt-auth/optional-access-jwt-auth.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { CommentsControllerSwaggerDecorators } from '../../../../core/swagger/decorators/blog-module/comments-controller.swagger-decorators';
import { ExtractUserDataFromRequest } from '../../../user/api/auth/decorators/param-extraction/extract-user-data-from-request.param-decorator';

/*Контроллер для комментариев.*/
@ApiTags(SETTINGS.COMMENTS_API_TAG)
@Controller(SETTINGS.COMMENTS_PREFIX)
export class CommentsController {
  public constructor(
    private readonly commentsService: CommentsPostgresqlService,
    private readonly commentsQueryService: CommentsPostgresqlQueryService
  ) {}

  /*001. GET-запрос по поиску комментария по ID, используя URI-параметры.*/
  @CommentsControllerSwaggerDecorators.getCommentById
  @UseGuards(OptionalAccessJwtAuthGuard)
  @Get(SETTINGS.COMMENTS_GET_COMMENT_BY_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getCommentById(
    @Param('id') id: string,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<CommentOutputDTO> {
    /*Просим query-сервис "CommentsQueryService" найти комментарий по ID.*/
    return this.commentsQueryService.findById(id, userAccessJwtAuthContext?.id);
  }

  /*002. PUT-запрос по изменению комментария по ID, используя URI-параметры.*/
  @CommentsControllerSwaggerDecorators.updateCommentById
  @UseGuards(AccessJwtAuthGuard)
  @Put(SETTINGS.COMMENTS_UPDATE_COMMENT_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateCommentById(
    @Param('id') id: string,
    @Body() body: UpdateCommentByIdInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим сервис "CommentsService" изменить комментарий по ID.*/
    await this.commentsService.updateById(id, body, userAccessJwtAuthContext);
  }

  /*003. PUT-запрос по изменению статуса лайка комментария по ID комментария, используя URI-параметры.*/
  @CommentsControllerSwaggerDecorators.updateCommentLikeStatusById
  @UseGuards(AccessJwtAuthGuard)
  @Put(SETTINGS.COMMENTS_LIKE_COMMENT_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateCommentLikeStatusById(
    @Param('id') id: string,
    @Body() body: UpdateCommentLikeStatusByIdInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим сервис "CommentsService" изменить статус лайка комментария по ID комментария.*/
    await this.commentsService.updateCommentLikeStatusById(id, body, userAccessJwtAuthContext);
  }

  /*004. DELETE-запрос по удалению комментария по ID, используя URI-параметры.*/
  @CommentsControllerSwaggerDecorators.deleteCommentById
  @UseGuards(AccessJwtAuthGuard)
  @Delete(SETTINGS.COMMENTS_DELETE_COMMENT_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteCommentById(
    @Param('id') id: string,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим сервис "CommentsService" удалить комментарий по ID.*/
    await this.commentsService.deleteById(id, userAccessJwtAuthContext);
  }
}
