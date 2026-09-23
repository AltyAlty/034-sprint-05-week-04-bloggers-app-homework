import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from '../../domain/comments/comment.entity';
import { CommentLikeData } from '../../domain/comments/comment-like-data.entity';
import { CommentDocumentType } from '../../domain/comments/document-types/comment.document-type';
import { CommentLikeDataDocumentType } from '../../domain/comments/document-types/comment-like-data.document-type';
import type { CommentModelType } from '../../domain/comments/model-types/comment.model-type';
import type { CommentLikeDataModelType } from '../../domain/comments/model-types/comment-like-data.model-type';

/*Репозиторий для комментариев.*/
@Injectable()
export class CommentsRepository {
  public constructor(
    @InjectModel(Comment.name) private readonly commentModel: CommentModelType,
    @InjectModel(CommentLikeData.name) private readonly commentLikeDataModel: CommentLikeDataModelType
  ) {}

  /*Метод для сохранения комментария в БД.*/
  public async save(comment: CommentDocumentType): Promise<void> {
    await comment.save();
  }

  /*Метод для сохранения данных о лайке комментария в БД.*/
  public async saveCommentLikeData(commentLikeData: CommentLikeDataDocumentType): Promise<void> {
    await commentLikeData.save();
  }

  /*Метод для поиска комментария по ID в БД.*/
  public async findById(id: string): Promise<CommentDocumentType | null> {
    /*Просим модель "CommentModel" найти комментарий по ID в БД.*/
    return await this.commentModel.findOne({ _id: id, deletedAt: null });
  }

  /*Метод для поиска данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async findCommentLikeDataByCommentIdAndUserId(
    commentId: string,
    userId: string
  ): Promise<CommentLikeDataDocumentType | null> {
    /*Просим модель "CommentLikeDataModel" найти данные о лайке комментария по ID комментария и ID пользователя в БД.*/
    return await this.commentLikeDataModel.findOne({ commentId, userId });
  }

  /*Метод для hard удаления комментария по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим модель "CommentModel" удалить комментарий по ID в БД.*/
    await this.commentModel.deleteOne({ _id: id });
  }

  /*Метод для hard удаления комментариев по ID поста в БД.*/
  public async deleteAllByPostId(id: string): Promise<void> {
    /*Просим модель "CommentModel" удалить комментарии по ID поста в БД.*/
    await this.commentModel.deleteMany({ postId: id });
  }

  /*Метод для hard удаления комментариев по ID блога в БД.*/
  public async deleteAllByBlogId(id: string): Promise<void> {
    /*Просим модель "CommentModel" удалить комментарии по ID блога в БД.*/
    await this.commentModel.deleteMany({ blogId: id });
  }

  /*Метод для hard удаления данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async deleteCommentLikeDataByCommentIdAndUserId(commentId: string, userId: string): Promise<void> {
    /*Просим модель "CommentLikeDataModel" удалить данные о лайке комментария по ID комментария и ID пользователя в
    БД.*/
    await this.commentLikeDataModel.deleteOne({ commentId, userId });
  }

  /*Метод для hard удаления данных о лайках комментария по ID комментария в БД.*/
  public async deleteAllCommentLikeDataByCommentId(id: string): Promise<void> {
    /*Просим модель "CommentLikeDataModel" удалить данные о лайках комментария по ID комментария в БД.*/
    await this.commentLikeDataModel.deleteMany({ commentId: id });
  }

  /*Метод для hard удаления данных о лайках комментариев по ID поста в БД.*/
  public async deleteAllCommentLikeDataByPostId(id: string): Promise<void> {
    /*Просим модель "CommentLikeDataModel" удалить данные о лайках комментариев по ID поста в БД.*/
    await this.commentLikeDataModel.deleteMany({ postId: id });
  }

  /*Метод для hard удаления данных о лайках комментариев по ID блога в БД.*/
  public async deleteAllCommentLikeDataByBlogId(id: string): Promise<void> {
    /*Просим модель "CommentLikeDataModel" удалить данные о лайках комментариев по ID блога в БД.*/
    await this.commentLikeDataModel.deleteMany({ blogId: id });
  }
}
