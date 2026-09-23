import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../../infrastructure/comments/comments.repository';
import { PostsRepository } from '../../infrastructure/posts/posts.repository';
import { CommentLikeStatusInputDTO } from '../../api/comments/input-dto/update-comment-like-status-by-id.input-dto';
import { CommentOutputDTO } from '../../api/comments/output-dto/comment.output-dto';
import { CommentLikeStatusOutputDTO } from '../../api/comments/output-dto/comment-like-status.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { Comment } from '../../domain/comments/comment.entity';
import { CommentLikeData } from '../../domain/comments/comment-like-data.entity';
import { CommentDocumentType } from '../../domain/comments/document-types/comment.document-type';
import { CommentLikeDataDocumentType } from '../../domain/comments/document-types/comment-like-data.document-type';
import { CommentLikeStatusDomainDTO } from '../../domain/comments/domain-dto/comment-like-status.domain-dto';
import type { CommentModelType } from '../../domain/comments/model-types/comment.model-type';
import type { CommentLikeDataModelType } from '../../domain/comments/model-types/comment-like-data.model-type';
import { PostDocumentType } from '../../domain/posts/document-types/post.document-type';
import { CreateCommentForPostDTO } from './dto/create-comment-for-post.dto';
import { UpdateCommentDTO } from './dto/update-comment.dto';
import { UpdateCommentLikeStatusByIdDTO } from './dto/update-comment-like-status-by-id.dto';

/*Сервис для комментариев.*/
@Injectable()
export class CommentsService {
  public constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
    @InjectModel(CommentLikeData.name) private readonly commentLikeDataModel: CommentLikeDataModelType,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository
  ) {}

  /*Метод для создания комментария в посте.*/
  public async createForPost(
    postId: string,
    dto: CreateCommentForPostDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<CommentOutputDTO> {
    /*Просим репозиторий "PostsRepository" найти пост по ID.*/
    const post: PostDocumentType | null = await this.postsRepository.findById(postId);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileCommentCreating,
        message: 'Post to create a comment not found',
        field: 'postId',
      });

    /*Если пост был найден, то просим модель "CommentModel" создать комментарий в посте.*/
    const comment: CommentDocumentType = this.commentModel.createInstance({
      ...dto,
      postId,
      blogId: post.blogId,
      commentatorInfo: { userId: userAccessJwtAuthContext.id, userLogin: userAccessJwtAuthContext.login },
    });

    /*Просим репозиторий "CommentsRepository" сохранить комментарий в БД.*/
    await this.commentsRepository.save(comment);
    /*Преобразовываем комментарий из БД в подготовленный для отправки клиенту комментарий и возвращаем его.*/
    return CommentOutputDTO.mapFromCommentDocumentTypeToCommentOutputDTO(comment, CommentLikeStatusOutputDTO.None);
  }

  /*Метод для изменения комментария по ID.*/
  public async updateById(
    id: string,
    dto: UpdateCommentDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: CommentDocumentType | null = await this.commentsRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileUpdating,
        message: 'Comment to update not found',
        field: 'id',
      });

    /*Если пользователь не является владельцем комментария, то выбрасываем исключение с информацией об этом.*/
    if (comment.commentatorInfo.userId !== userAccessJwtAuthContext.id)
      throw new DomainException({
        code: DomainExceptionCode.WrongCommentOwnerWhileUpdating,
        message: 'The user is not the owner of the comment to update',
        field: 'id',
      });

    /*Если комментарий был найден и пользователь является его владельцем, то изменяем его.*/
    comment.update(dto);
    /*Просим репозиторий "commentsRepository" сохранить измененный комментарий.*/
    await this.commentsRepository.save(comment);
  }

  /*Метод для изменения статус лайка комментария по ID комментария.*/
  public async updateCommentLikeStatusById(
    id: string,
    dto: UpdateCommentLikeStatusByIdDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: CommentDocumentType | null = await this.commentsRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileUpdatingLikeStatus,
        message: 'Comment to update like status not found',
        field: 'id',
      });
    }

    /*Получаем ID поста, в котором находиться комментарий.*/
    const postId: string = comment.postId;
    /*Получаем ID блога, в котором находиться комментарий.*/
    const blogId: string = comment.blogId;

    /*Если комментарий был найден, то просим репозиторий "CommentsRepository" найти данные о лайке для комментария по ID
    комментария и ID пользователя в БД.*/
    const commentLikeData: CommentLikeDataDocumentType | null =
      await this.commentsRepository.findCommentLikeDataByCommentIdAndUserId(id, userAccessJwtAuthContext.id);

    /*Если пользователь пытается установить повторный статус лайка, то ничего не делаем.*/
    if (
      (commentLikeData && commentLikeData.likeStatus === (dto.likeStatus as unknown as CommentLikeStatusDomainDTO)) ||
      (!commentLikeData && dto.likeStatus === CommentLikeStatusInputDTO.None)
    ) {
      return;
    }

    /*Если пользователь хочет убрать лайк/дизлайк.*/
    if (dto.likeStatus === CommentLikeStatusInputDTO.None) {
      /*Просим репозиторий "CommentsRepository" удалить данные о лайке комментария по ID комментария и ID пользователя в
      БД.*/
      await this.commentsRepository.deleteCommentLikeDataByCommentIdAndUserId(id, userAccessJwtAuthContext.id);

      /*Изменяем количество лайков и дизлайков у комментария в БД:
      1. Если уже стоял лайк, то уменьшить количество лайков на 1.
      2. Если уже стоял дизлайк, то уменьшить количество дизлайков на 1.*/
      if (commentLikeData?.likeStatus === CommentLikeStatusDomainDTO.Like) {
        comment.updateCommentLikesCount({ likesCount: -1, dislikesCount: 0 });
      } else {
        comment.updateCommentLikesCount({ likesCount: 0, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить лайк.*/
    if (dto.likeStatus === CommentLikeStatusInputDTO.Like) {
      /*Если еще не был поставлен лайк/дизлайк.*/
      if (!commentLikeData) {
        /*Просим модель "CommentLikeDataModel" создать данные о лайке комментария в БД.*/
        const commentLikeData: CommentLikeDataDocumentType = this.commentLikeDataModel.createInstance({
          commentId: id,
          postId,
          blogId,
          userId: userAccessJwtAuthContext.id,
          likeStatus: dto.likeStatus as unknown as CommentLikeStatusDomainDTO,
        });

        /*Просим репозиторий "CommentsRepository" сохранить данные о лайке комментария в БД.*/
        await this.commentsRepository.saveCommentLikeData(commentLikeData);
        /*Изменяем количество лайков и дизлайков у комментария в БД:
        1. Увеличить количество лайков на 1.
        2. Не менять количество дизлайков.*/
        comment.updateCommentLikesCount({ likesCount: 1, dislikesCount: 0 });
        /*Если уже стоял дизлайк.*/
      } else if (commentLikeData.likeStatus === CommentLikeStatusDomainDTO.Dislike) {
        /*Изменяем данные о лайке комментария в БД.*/
        commentLikeData.update({ likeStatus: dto.likeStatus as unknown as CommentLikeStatusDomainDTO });
        /*Просим репозиторий "CommentsRepository" сохранить данные о лайке комментария в БД.*/
        await this.commentsRepository.saveCommentLikeData(commentLikeData);
        /*Изменяем количество лайков и дизлайков у комментария в БД:
        1. Увеличить количество лайков на 1.
        2. Уменьшить количество дизлайков на 1.*/
        comment.updateCommentLikesCount({ likesCount: 1, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить дизлайк.*/
    if (dto.likeStatus === CommentLikeStatusInputDTO.Dislike) {
      /*Если еще не был поставлен лайк/дизлайк.*/
      if (!commentLikeData) {
        /*Просим модель "CommentLikeDataModel" создать данные о лайке комментария в БД.*/
        const commentLikeData: CommentLikeDataDocumentType = this.commentLikeDataModel.createInstance({
          commentId: id,
          postId,
          blogId,
          userId: userAccessJwtAuthContext.id,
          likeStatus: dto.likeStatus as unknown as CommentLikeStatusDomainDTO,
        });

        /*Просим репозиторий "CommentsRepository" сохранить данные о лайке комментария в БД.*/
        await this.commentsRepository.saveCommentLikeData(commentLikeData);
        /*Изменяем количество лайков и дизлайков у комментария в БД:
        1. Не менять количество лайков.
        2. Увеличить количество дизлайков на 1.*/
        comment.updateCommentLikesCount({ likesCount: 0, dislikesCount: 1 });
        /*Если уже стоял лайк.*/
      } else if (commentLikeData?.likeStatus === CommentLikeStatusDomainDTO.Like) {
        /*Изменяем данные о лайке комментария в БД.*/
        commentLikeData.update({ likeStatus: dto.likeStatus as unknown as CommentLikeStatusDomainDTO });
        /*Просим репозиторий "CommentsRepository" сохранить данные о лайке комментария в БД.*/
        await this.commentsRepository.saveCommentLikeData(commentLikeData);
        /*Изменяем количество лайков и дизлайков у комментария в БД:
        1. Уменьшить количество лайков на 1.
        2. Увеличить количество дизлайков на 1.*/
        comment.updateCommentLikesCount({ likesCount: -1, dislikesCount: 1 });
      }
    }

    /*Просим репозиторий "CommentsRepository" сохранить комментарий в БД.*/
    await this.commentsRepository.save(comment);
  }

  /*Метод для soft удаления комментария по ID.*/
  public async markAsDeletedById(id: string): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: CommentDocumentType | null = await this.commentsRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileDeleting,
        message: 'Comment to delete not found',
        field: 'id',
      });

    /*Если комментарий был найден, то помечаем его как удаленный.*/
    comment.markAsDeleted();
    /*Просим репозиторий "CommentsRepository" сохранить удаленный комментарий.*/
    await this.commentsRepository.save(comment);
  }

  /*Метод для hard удаления комментария по ID.*/
  public async deleteById(id: string, userAccessJwtAuthContext: UserAccessJwtAuthContextDTO): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: CommentDocumentType | null = await this.commentsRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileDeleting,
        message: 'Comment to delete not found',
        field: 'id',
      });

    /*Если пользователь не является владельцем комментария, то выбрасываем исключение с информацией об этом.*/
    if (comment.commentatorInfo.userId !== userAccessJwtAuthContext.id)
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
