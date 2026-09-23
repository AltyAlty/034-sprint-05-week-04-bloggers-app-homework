import { Injectable } from '@nestjs/common';
import { CommentsPostgresqlRepository } from '../../infrastructure/comments/comments-postgresql.repository';
import { PostsPostgresqlRepository } from '../../infrastructure/posts/posts-postgresql.repository';
import { CommentLikeDataPostgresqlDb } from '../../infrastructure/comments/postgresql-types/comment-like-data-postgresql-db.type';
import { CommentPostgresqlDb } from '../../infrastructure/comments/postgresql-types/comment-postgresql-db.type';
import { PostPostgresqlDb } from '../../infrastructure/posts/postgresql-types/post-postgresql-db.type';
import { CommentLikeStatusInputDTO } from '../../api/comments/input-dto/update-comment-like-status-by-id.input-dto';
import { CommentOutputDTO } from '../../api/comments/output-dto/comment.output-dto';
import { CommentLikeStatusOutputDTO } from '../../api/comments/output-dto/comment-like-status.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { CommentLikeStatusDomainDTO } from '../../domain/comments/domain-dto/comment-like-status.domain-dto';
import { CreateCommentForPostDTO } from './dto/create-comment-for-post.dto';
import { UpdateCommentDTO } from './dto/update-comment.dto';
import { UpdateCommentLikeStatusByIdDTO } from './dto/update-comment-like-status-by-id.dto';

/*Сервис для комментариев в PostgreSQL.*/
@Injectable()
export class CommentsPostgresqlService {
  public constructor(
    private readonly postsRepository: PostsPostgresqlRepository,
    private readonly commentsRepository: CommentsPostgresqlRepository
  ) {}

  /*Метод для создания комментария в посте.*/
  public async createForPost(
    postId: string,
    dto: CreateCommentForPostDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<CommentOutputDTO> {
    /*Просим репозиторий "PostsRepository" найти пост по ID.*/
    const post: PostPostgresqlDb | null = await this.postsRepository.findById(postId);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileCommentCreating,
        message: 'Post to create a comment not found',
        field: 'postId',
      });

    const comment: CommentPostgresqlDb = await this.commentsRepository.create({
      ...dto,
      postId,
      blogId: post.blog_id,
      userId: userAccessJwtAuthContext.id,
      userLogin: userAccessJwtAuthContext.login,
    });

    /*Преобразовываем комментарий из БД в подготовленный для отправки клиенту комментарий и возвращаем его.*/
    return CommentOutputDTO.mapFromCommentPostgresqlDbToCommentOutputDTO(comment, CommentLikeStatusOutputDTO.None);
  }

  /*Метод для изменения комментария по ID.*/
  public async updateById(
    id: string,
    dto: UpdateCommentDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: CommentPostgresqlDb | null = await this.commentsRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileUpdating,
        message: 'Comment to update not found',
        field: 'id',
      });

    /*Если пользователь не является владельцем комментария, то выбрасываем исключение с информацией об этом.*/
    if (comment.user_id !== userAccessJwtAuthContext.id)
      throw new DomainException({
        code: DomainExceptionCode.WrongCommentOwnerWhileUpdating,
        message: 'The user is not the owner of the comment to update',
        field: 'id',
      });

    /*Если комментарий был найден и пользователь является его владельцем, то просим репозиторий "commentsRepository"
    изменить его.*/
    await this.commentsRepository.updateById(id, dto);
  }

  /*Метод для изменения статус лайка комментария по ID комментария.*/
  public async updateCommentLikeStatusById(
    id: string,
    dto: UpdateCommentLikeStatusByIdDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: CommentPostgresqlDb | null = await this.commentsRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileUpdatingLikeStatus,
        message: 'Comment to update like status not found',
        field: 'id',
      });
    }

    /*Получаем ID блога, в котором находиться комментарий.*/
    const blogId: string = comment.blog_id;
    /*Получаем ID поста, в котором находиться комментарий.*/
    const postId: string = comment.post_id;
    /*Получаем ID пользователя.*/
    const userId: string = userAccessJwtAuthContext.id;
    /*Получаем статус лайка комментария.*/
    const likeStatus: CommentLikeStatusInputDTO = dto.likeStatus;

    /*Если комментарий был найден, то просим репозиторий "CommentsRepository" найти данные о лайке для комментария по ID
    комментария и ID пользователя в БД.*/
    const commentLikeData: CommentLikeDataPostgresqlDb | null =
      await this.commentsRepository.findCommentLikeDataByCommentIdAndUserId(id, userId);

    /*Если пользователь пытается установить повторный статус лайка, то ничего не делаем.*/
    if (
      (commentLikeData && commentLikeData.like_status === (likeStatus as unknown as CommentLikeStatusDomainDTO)) ||
      (!commentLikeData && likeStatus === CommentLikeStatusInputDTO.None)
    ) {
      return;
    }

    /*Если пользователь хочет убрать лайк/дизлайк.*/
    if (likeStatus === CommentLikeStatusInputDTO.None) {
      /*Просим репозиторий "CommentsRepository" удалить данные о лайке комментария по ID комментария и ID пользователя в
      БД.*/
      await this.commentsRepository.deleteCommentLikeDataByCommentIdAndUserId(id, userId);

      /*Просим репозиторий "CommentsRepository" изменить количество лайков и дизлайков у комментария в БД:
      1. Если уже стоял лайк, то уменьшить количество лайков на 1.
      2. Если уже стоял дизлайк, то уменьшить количество дизлайков на 1.*/
      if (commentLikeData?.like_status === CommentLikeStatusDomainDTO.Like) {
        await this.commentsRepository.updateCommentLikesCountById(id, { likesCount: -1, dislikesCount: 0 });
      } else {
        await this.commentsRepository.updateCommentLikesCountById(id, { likesCount: 0, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить лайк.*/
    if (likeStatus === CommentLikeStatusInputDTO.Like) {
      /*Если еще не был поставлен лайк/дизлайк.*/
      if (!commentLikeData) {
        /*Просим репозиторий "CommentsRepository" создать данные о лайке комментария в БД.*/
        await this.commentsRepository.createCommentLikeData({
          commentId: id,
          postId,
          blogId,
          userId,
          likeStatus: likeStatus as unknown as CommentLikeStatusDomainDTO,
        });

        /*Просим репозиторий "CommentsRepository" изменить количество лайков и дизлайков у комментария в БД:
        1. Увеличить количество лайков на 1.
        2. Не менять количество дизлайков.*/
        await this.commentsRepository.updateCommentLikesCountById(id, { likesCount: 1, dislikesCount: 0 });
        /*Если уже стоял дизлайк.*/
      } else if (commentLikeData.like_status === CommentLikeStatusDomainDTO.Dislike) {
        /*Просим репозиторий "CommentsRepository" изменить данные о лайке комментария в БД.*/
        await this.commentsRepository.updateCommentLikeDataByCommentIdAndUserId(
          id,
          userId,
          likeStatus as unknown as CommentLikeStatusDomainDTO
        );

        /*Просим репозиторий "CommentsRepository" изменить количество лайков и дизлайков у комментария в БД:
        1. Увеличить количество лайков на 1.
        2. Уменьшить количество дизлайков на 1.*/
        await this.commentsRepository.updateCommentLikesCountById(id, { likesCount: 1, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить дизлайк.*/
    if (likeStatus === CommentLikeStatusInputDTO.Dislike) {
      /*Если еще не был поставлен лайк/дизлайк.*/
      if (!commentLikeData) {
        /*Просим репозиторий "CommentsRepository" создать данные о лайке комментария в БД.*/
        await this.commentsRepository.createCommentLikeData({
          commentId: id,
          postId,
          blogId,
          userId,
          likeStatus: likeStatus as unknown as CommentLikeStatusDomainDTO,
        });

        /*Просим репозиторий "CommentsRepository" изменить количество лайков и дизлайков у комментария в БД:
        1. Не менять количество лайков.
        2. Увеличить количество дизлайков на 1.*/
        await this.commentsRepository.updateCommentLikesCountById(id, { likesCount: 0, dislikesCount: 1 });
        /*Если уже стоял лайк.*/
      } else if (commentLikeData?.like_status === CommentLikeStatusDomainDTO.Like) {
        /*Просим репозиторий "CommentsRepository" изменить данные о лайке комментария в БД.*/
        await this.commentsRepository.updateCommentLikeDataByCommentIdAndUserId(
          id,
          userId,
          likeStatus as unknown as CommentLikeStatusDomainDTO
        );

        /*Просим репозиторий "CommentsRepository" изменить количество лайков и дизлайков у комментария в БД:
        1. Уменьшить количество лайков на 1.
        2. Увеличить количество дизлайков на 1.*/
        await this.commentsRepository.updateCommentLikesCountById(id, { likesCount: -1, dislikesCount: 1 });
      }
    }
  }

  /*Метод для soft удаления комментария по ID.*/
  public async markAsDeletedById(id: string): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: CommentPostgresqlDb | null = await this.commentsRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileDeleting,
        message: 'Comment to delete not found',
        field: 'id',
      });

    /*Если комментарий был найден, то просим репозиторий "CommentsRepository" пометить его как удаленный в БД.*/
    await this.commentsRepository.markAsDeletedById(id);
  }

  /*Метод для hard удаления комментария по ID.*/
  public async deleteById(id: string, userAccessJwtAuthContext: UserAccessJwtAuthContextDTO): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: CommentPostgresqlDb | null = await this.commentsRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileDeleting,
        message: 'Comment to delete not found',
        field: 'id',
      });

    /*Если пользователь не является владельцем комментария, то выбрасываем исключение с информацией об этом.*/
    if (comment.user_id !== userAccessJwtAuthContext.id)
      throw new DomainException({
        code: DomainExceptionCode.WrongCommentOwnerWhileDeleting,
        message: 'The user is not the owner of the comment to delete',
        field: 'id',
      });

    /*Если комментарий был найден и пользователь является его владельцем, то просим репозиторий "CommentsRepository"
    удалить данные о лайках комментария по ID комментария в БД.*/
    await this.commentsRepository.deleteAllCommentLikeDataByCommentId(id);
    /*Просим репозиторий "CommentsRepository" удалить комментарий по ID в БД.*/
    await this.commentsRepository.deleteById(id);
  }

  /*Метод для hard удаления комментариев по ID поста.*/
  public async deleteAllByPostId(id: string): Promise<void> {
    /*Просим репозиторий "CommentsRepository" удалить данные о лайках комментария по ID поста в БД.*/
    await this.commentsRepository.deleteAllCommentLikeDataByPostId(id);
    /*Просим репозиторий "CommentsRepository" удалить комментарии по ID поста в БД.*/
    await this.commentsRepository.deleteAllByPostId(id);
  }

  /*Метод для hard удаления комментариев по ID блога.*/
  public async deleteAllByBlogId(id: string): Promise<void> {
    /*Просим репозиторий "CommentsRepository" удалить данные о лайках комментария по ID блога в БД.*/
    await this.commentsRepository.deleteAllCommentLikeDataByBlogId(id);
    /*Просим репозиторий "CommentsRepository" удалить комментарии по ID блога в БД.*/
    await this.commentsRepository.deleteAllByBlogId(id);
  }
}
