import { Injectable } from '@nestjs/common';
import { CommentsPostgresqlQueryRepository } from '../../infrastructure/comments/comments-postgresql.query-repository';
import { PostsPostgresqlQueryRepository } from '../../infrastructure/posts/posts-postgresql.query-repository';
import { CommentLikeDataPostgresqlDb } from '../../infrastructure/comments/postgresql-types/comment-like-data-postgresql-db.type';
import {
  CommentListPostgresqlDb,
  CommentPostgresqlDb,
} from '../../infrastructure/comments/postgresql-types/comment-postgresql-db.type';
import { PostPostgresqlDb } from '../../infrastructure/posts/postgresql-types/post-postgresql-db.type';
import { GetCommentListByPostIdQueryInputDTO } from '../../api/posts/input-dto/query/get-comment-list-by-post-id-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { CommentOutputDTO } from '../../api/comments/output-dto/comment.output-dto';
import { CommentLikeStatusOutputDTO } from '../../api/comments/output-dto/comment-like-status.output-dto';
import { CommentListOutputDTO } from '../../api/comments/output-dto/comment-list.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';

/*Query-сервис для комментариев в PostgreSQL.*/
@Injectable()
export class CommentsPostgresqlQueryService {
  public constructor(
    private readonly postsQueryRepository: PostsPostgresqlQueryRepository,
    private readonly commentsQueryRepository: CommentsPostgresqlQueryRepository
  ) {}

  /*Метод для поиска комментария по ID.*/
  public async findById(id: string, userId?: string): Promise<CommentOutputDTO> {
    /*Просим query-репозиторий "CommentsQueryRepository" найти комментарий по ID в БД.*/
    const comment: CommentPostgresqlDb | null = await this.commentsQueryRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFound,
        message: 'Comment not found',
        field: 'id',
      });

    /*Если комментарий был найден, то формируем статус лайка комментария.*/
    let likeStatus: CommentLikeStatusOutputDTO = CommentLikeStatusOutputDTO.None;

    /*Если в запросе был указан AT.*/
    if (userId) {
      /*Просим query-репозиторий "CommentsQueryRepository" найти данные о лайке комментария в БД.*/
      const commentLikeData: CommentLikeDataPostgresqlDb | null =
        await this.commentsQueryRepository.findCommentLikeDataByCommentIdAndUserId(id, userId);

      /*Если данные о лайке комментария были найдены, то получаем статус лайка.*/
      if (commentLikeData) likeStatus = commentLikeData.like_status as unknown as CommentLikeStatusOutputDTO;
    }

    /*Преобразовываем комментарий из БД в подготовленный для отправки клиенту комментарий и возвращаем его.*/
    return CommentOutputDTO.mapFromCommentPostgresqlDbToCommentOutputDTO(comment, likeStatus);
  }

  /*Метод для поиска комментариев по ID поста.*/
  public async findAllByPostId(
    postId: string,
    dto: GetCommentListByPostIdQueryInputDTO,
    userId?: string
  ): Promise<PaginationMetaDataOutputDTO<CommentListOutputDTO>> {
    /*Просим query-репозиторий "PostsQueryRepository" найти пост по ID в БД.*/
    const post: PostPostgresqlDb | null = await this.postsQueryRepository.findById(postId);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileCommentSearching,
        message: 'Post to find comments not found',
        field: 'id',
      });

    /*Если пост был найден, то просим query-репозиторий "CommentsQueryRepository" найти комментарии по ID поста в БД.*/
    const { items, totalCount }: { items: CommentListPostgresqlDb; totalCount: number } =
      await this.commentsQueryRepository.findAllByPostId(postId, dto);

    /*Преобразовываем комментарии из БД в подготовленные для отправки клиенту комментарии.*/
    const commentListOutput: CommentListOutputDTO =
      await CommentOutputDTO.mapFromCommentListPostgresqlDbToCommentListOutputDTO(
        items,
        this.commentsQueryRepository,
        userId
      );

    /*Преобразовываем подготовленные для отправки клиенту комментарии в подготовленные для отправки клиенту с
    пагинацией комментарии и возвращаем их.*/
    return PaginationMetaDataOutputDTO.mapToOutputDTO({
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: totalCount,
      items: commentListOutput,
    });
  }
}
