import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BLOG_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/blog.validation-constraints';
import { COMMENT_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/comment.validation-constraints';
import { POST_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/post.validation-constraints';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/user.validation-constraints';
import { CommentLikeDataDocumentType } from './document-types/comment-like-data.document-type';
import { CommentLikeStatusDomainDTO } from './domain-dto/comment-like-status.domain-dto';
import { CreateCommentLikeDataDomainDTO } from './domain-dto/create-comment-like-data.domain-dto';
import { UpdateCommentLikeDataDomainDTO } from './domain-dto/update-comment-like-data.domain-dto';

/*Класс для сущности данных о лайке комментария.*/
@Schema()
export class CommentLikeData {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: COMMENT_VALIDATION_CONSTRAINTS.ID.MIN_LENGTH,
    maxlength: COMMENT_VALIDATION_CONSTRAINTS.ID.MAX_LENGTH,
  })
  public commentId: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: POST_VALIDATION_CONSTRAINTS.ID.MIN_LENGTH,
    maxlength: POST_VALIDATION_CONSTRAINTS.ID.MAX_LENGTH,
  })
  public postId: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: BLOG_VALIDATION_CONSTRAINTS.ID.MIN_LENGTH,
    maxlength: BLOG_VALIDATION_CONSTRAINTS.ID.MAX_LENGTH,
  })
  public blogId: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: USER_VALIDATION_CONSTRAINTS.ID.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.ID.MAX_LENGTH,
  })
  public userId: string;

  @Prop({ type: String, required: true, enum: Object.values(CommentLikeStatusDomainDTO) })
  public likeStatus: CommentLikeStatusDomainDTO;

  @Prop({ type: Date, immutable: true, default: Date.now })
  public addedAt: Date;

  /*Метод для создания данных о лайке комментария.*/
  public static createInstance(dto: CreateCommentLikeDataDomainDTO): CommentLikeDataDocumentType {
    const commentLikeData = new this();
    commentLikeData.commentId = dto.commentId;
    commentLikeData.postId = dto.postId;
    commentLikeData.blogId = dto.blogId;
    commentLikeData.userId = dto.userId;
    commentLikeData.likeStatus = dto.likeStatus;
    return commentLikeData as CommentLikeDataDocumentType;
  }

  /*Метод для изменения данных о лайке комментария.*/
  public update(dto: UpdateCommentLikeDataDomainDTO): void {
    this.likeStatus = dto.likeStatus;
    this.addedAt = new Date();
  }
}

/*Создаем схему для данных о лайке комментария на основе класса для сущности данных о лайке комментария.*/
export const CommentLikeDataSchema = SchemaFactory.createForClass(CommentLikeData);
/*Регистрируем методы класса для сущности данных о лайке комментария в схеме для данных о лайке комментария.*/
CommentLikeDataSchema.loadClass(CommentLikeData);
