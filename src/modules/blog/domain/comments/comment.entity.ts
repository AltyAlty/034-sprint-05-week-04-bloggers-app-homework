import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { BLOG_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/blog.validation-constraints';
import { COMMENT_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/comment.validation-constraints';
import { POST_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/post.validation-constraints';
import { CommentDocumentType } from './document-types/comment.document-type';
import { CreateCommentDomainDTO } from './domain-dto/create-comment.domain-dto';
import { UpdateCommentDomainDTO } from './domain-dto/update-comment.domain-dto';
import { UpdateCommentLikesCountDomainDTO } from './domain-dto/update-comment-likes-count.domain-dto';
import { CommentatorInfo, CommentatorInfoSchema } from './schemas/commentator-info.schema';
import { LikesInfo, LikesInfoSchema } from './schemas/likes-info.schema';

/*Класс для сущности комментария.*/
@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: COMMENT_VALIDATION_CONSTRAINTS.CONTENT.MIN_LENGTH,
    maxlength: COMMENT_VALIDATION_CONSTRAINTS.CONTENT.MAX_LENGTH,
  })
  public content: string;

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

  @Prop({ type: CommentatorInfoSchema })
  public commentatorInfo: CommentatorInfo;

  @Prop({ type: LikesInfoSchema })
  public likesInfo: LikesInfo;

  public createdAt: Date;
  public updatedAt: Date;

  @Prop({ type: Date, default: null })
  public deletedAt: Date | null;

  /*Виртуальное свойство для получения ID комментария.*/
  public get id(): string {
    return (this as unknown as CommentDocumentType)._id.toString();
  }

  /*Метод для создания комментария.*/
  public static createInstance(dto: CreateCommentDomainDTO): CommentDocumentType {
    const comment = new this();
    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.blogId = dto.blogId;
    comment.commentatorInfo = dto.commentatorInfo;
    comment.likesInfo = { likesCount: 0, dislikesCount: 0 };
    return comment as CommentDocumentType;
  }

  /*Метод для изменения комментария.*/
  public update(dto: UpdateCommentDomainDTO): void {
    this.content = dto.content;
  }

  /*Метод для изменения количества лайков и дизлайков у комментария.*/
  public updateCommentLikesCount(dto: UpdateCommentLikesCountDomainDTO): void {
    this.likesInfo.likesCount += dto.likesCount;
    this.likesInfo.dislikesCount += dto.dislikesCount;
  }

  /*Метод для soft удаления комментария.*/
  public markAsDeleted(): void {
    if (this.deletedAt !== null)
      throw new DomainException({
        code: DomainExceptionCode.CommentAlreadyMarkedAsDeleted,
        message: 'Comment is already marked as deleted',
        field: '',
      });

    this.deletedAt = new Date();
  }
}

/*Создаем схему для комментария на основе класса для сущности комментария.*/
export const CommentSchema = SchemaFactory.createForClass(Comment);
/*Регистрируем методы класса для сущности комментария в схеме для комментария.*/
CommentSchema.loadClass(Comment);
