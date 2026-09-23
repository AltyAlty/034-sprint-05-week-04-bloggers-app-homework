import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BLOG_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/blog.validation-constraints';
import { POST_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/post.validation-constraints';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/user.validation-constraints';
import { PostLikeDataDocumentType } from './document-types/post-like-data.document-type';
import { CreatePostLikeDataDomainDTO } from './domain-dto/create-post-like-data.domain-dto';
import { PostLikeStatusDomainDTO } from './domain-dto/post-like-status.domain-dto';
import { UpdatePostLikeDataDomainDTO } from './domain-dto/update-post-like-data.domain-dto';

/*Класс для сущности данных о лайке поста.*/
@Schema()
export class PostLikeData {
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

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: USER_VALIDATION_CONSTRAINTS.LOGIN.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.LOGIN.MAX_LENGTH,
  })
  public login: string;

  @Prop({ type: String, required: true, enum: Object.values(PostLikeStatusDomainDTO) })
  public likeStatus: PostLikeStatusDomainDTO;

  @Prop({ type: Date, immutable: true, default: Date.now })
  public addedAt: Date;

  /*Метод для создания данных о лайке поста.*/
  public static createInstance(dto: CreatePostLikeDataDomainDTO): PostLikeDataDocumentType {
    const postLikeData = new this();
    postLikeData.postId = dto.postId;
    postLikeData.blogId = dto.blogId;
    postLikeData.userId = dto.userId;
    postLikeData.login = dto.login;
    postLikeData.likeStatus = dto.likeStatus;
    return postLikeData as PostLikeDataDocumentType;
  }

  /*Метод для изменения данных о лайке поста.*/
  public update(dto: UpdatePostLikeDataDomainDTO): void {
    this.likeStatus = dto.likeStatus;
    this.addedAt = new Date();
  }
}

/*Создаем схему для данных о лайке поста на основе класса для сущности данных о лайке поста.*/
export const PostLikeDataSchema = SchemaFactory.createForClass(PostLikeData);
/*Регистрируем методы класса для сущности данных о лайке поста в схеме для данных о лайке поста.*/
PostLikeDataSchema.loadClass(PostLikeData);
