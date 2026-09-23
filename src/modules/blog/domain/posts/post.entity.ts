import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { BLOG_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/blog.validation-constraints';
import { POST_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/post.validation-constraints';
import { PostDocumentType } from './document-types/post.document-type';
import { CreatePostDomainDTO } from './domain-dto/create-post.domain-dto';
import { UpdatePostDomainDTO } from './domain-dto/update-post.domain-dto';
import { UpdatePostLikesCountDomainDTO } from './domain-dto/update-post-likes-count.domain-dto';
import { ExtendedLikesInfo, ExtendedLikesInfoSchema } from './schemas/extended-likes-info.schema';

/*Класс для сущности поста.*/
@Schema({ timestamps: true })
export class Post {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: POST_VALIDATION_CONSTRAINTS.TITLE.MIN_LENGTH,
    maxlength: POST_VALIDATION_CONSTRAINTS.TITLE.MAX_LENGTH,
  })
  public title: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: POST_VALIDATION_CONSTRAINTS.SHORT_DESCRIPTION.MIN_LENGTH,
    maxlength: POST_VALIDATION_CONSTRAINTS.SHORT_DESCRIPTION.MAX_LENGTH,
  })
  public shortDescription: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: POST_VALIDATION_CONSTRAINTS.CONTENT.MIN_LENGTH,
    maxlength: POST_VALIDATION_CONSTRAINTS.CONTENT.MAX_LENGTH,
  })
  public content: string;

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
    minlength: BLOG_VALIDATION_CONSTRAINTS.NAME.MIN_LENGTH,
    maxlength: BLOG_VALIDATION_CONSTRAINTS.NAME.MAX_LENGTH,
  })
  public blogName: string;

  @Prop({ type: ExtendedLikesInfoSchema })
  public extendedLikesInfo: ExtendedLikesInfo;

  public createdAt: Date;
  public updatedAt: Date;

  @Prop({ type: Date, default: null })
  public deletedAt: Date | null;

  /*Виртуальное свойство для получения ID поста.*/
  public get id(): string {
    return (this as unknown as PostDocumentType)._id.toString();
  }

  /*Метод для создания поста.*/
  public static createInstance(dto: CreatePostDomainDTO): PostDocumentType {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
    post.extendedLikesInfo = { likesCount: 0, dislikesCount: 0 };
    return post as PostDocumentType;
  }

  /*Метод для изменения поста.*/
  public update(dto: UpdatePostDomainDTO): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
  }

  /*Метод для изменения количества лайков и дизлайков у поста.*/
  public updatePostLikesCount(dto: UpdatePostLikesCountDomainDTO): void {
    this.extendedLikesInfo.likesCount += dto.likesCount;
    this.extendedLikesInfo.dislikesCount += dto.dislikesCount;
  }

  /*Метод для soft удаления поста.*/
  public markAsDeleted(): void {
    if (this.deletedAt !== null)
      throw new DomainException({
        code: DomainExceptionCode.PostAlreadyMarkedAsDeleted,
        message: 'Post is already marked as deleted',
        field: '',
      });

    this.deletedAt = new Date();
  }
}

/*Создаем схему для поста на основе класса для сущности поста.*/
export const PostSchema = SchemaFactory.createForClass(Post);
/*Регистрируем методы класса для сущности поста в схеме для поста.*/
PostSchema.loadClass(Post);
