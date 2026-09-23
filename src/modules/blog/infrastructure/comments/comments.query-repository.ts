import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';
import { GetCommentListByPostIdQueryInputDTO } from '../../api/posts/input-dto/query/get-comment-list-by-post-id-query.input-dto';
import { CommentLikesDataListOutputDTO } from '../../api/comments/output-dto/comment-likes-data-list.output-dto';
import { Comment } from '../../domain/comments/comment.entity';
import { CommentLikeData } from '../../domain/comments/comment-like-data.entity';
import { CommentDocumentType } from '../../domain/comments/document-types/comment.document-type';
import { CommentLikeDataDocumentType } from '../../domain/comments/document-types/comment-like-data.document-type';
import { CommentListDocumentType } from '../../domain/comments/document-types/comment-list.document-type';
import type { CommentModelType } from '../../domain/comments/model-types/comment.model-type';
import type { CommentLikeDataModelType } from '../../domain/comments/model-types/comment-like-data.model-type';

/*Query-репозиторий для комментариев.*/
@Injectable()
export class CommentsQueryRepository {
  public constructor(
    @InjectModel(Comment.name) private readonly commentModel: CommentModelType,
    @InjectModel(CommentLikeData.name) private readonly commentLikeDataModel: CommentLikeDataModelType
  ) {}

  /*Метод для поиска комментария по ID в БД.*/
  public async findById(id: string): Promise<CommentDocumentType | null> {
    /*Просим модель "CommentModel" найти комментарий по ID в БД.*/
    return await this.commentModel.findOne({ _id: id, deletedAt: null });
  }

  /*Метод для поиска комментариев по ID поста в БД.*/
  public async findAllByPostId(
    postId: string,
    dto: GetCommentListByPostIdQueryInputDTO
  ): Promise<{ items: CommentListDocumentType; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();
    /*Динамически собираем фильтр для поиска в MongoDB. Начинаем с пустого фильтра если используем hard удаление, либо с
    "deletedAt: null", если используем soft удаление.*/
    const filter: QueryFilter<CommentDocumentType> = { deletedAt: null };
    /*Добавляем в фильтр ID поста.*/
    filter.postId = postId;

    /*Просим модель "CommentModel" найти комментарии в посте по ID в БД и подсчитать общее количество документов,
    подходящих под фильтр, без учета пагинации.*/
    const [items, totalCount]: [CommentListDocumentType, number] = await Promise.all([
      this.commentModel
        .find(filter)
        .sort({ [dto.sortBy]: dto.sortDirection })
        .skip(skip)
        .limit(dto.pageSize),
      this.commentModel.countDocuments(filter),
    ]);

    /*Возвращаем данные по комментариям.*/
    return { items, totalCount };
  }

  /*Метод для поиска данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async findCommentLikeDataByCommentIdAndUserId(
    commentId: string,
    userId: string
  ): Promise<CommentLikeDataDocumentType | null> {
    /*Просим модель "CommentLikeDataModel" найти данные о лайке комментария по ID комментария и ID пользователя в БД.*/
    return await this.commentLikeDataModel.findOne({ commentId, userId });
  }

  /*Метод для поиска данных о лайках комментариев по ID комментариев и ID пользователя в БД.*/
  public async findAllCommentLikesDataByCommentIdsAndUserId(
    commentIds: string[],
    userId: string
  ): Promise<CommentLikesDataListOutputDTO> {
    /*Просим модель "CommentLikeDataModel" найти данные о лайках комментариев по ID комментариев и ID пользователя в
    БД.*/
    return await this.commentLikeDataModel.find({ commentId: { $in: commentIds }, userId }).lean();
  }
}
