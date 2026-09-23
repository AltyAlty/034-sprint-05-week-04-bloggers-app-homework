import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { BLOG_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/blog.validation-constraints';
import { BlogDocumentType } from './document-types/blog.document-type';
import { CreateBlogDomainDTO } from './domain-dto/create-blog.domain-dto';
import { UpdateBlogDomainDTO } from './domain-dto/update-blog.domain-dto';

/*Класс для сущности блога.*/
@Schema({ timestamps: true })
export class Blog {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: BLOG_VALIDATION_CONSTRAINTS.NAME.MIN_LENGTH,
    maxlength: BLOG_VALIDATION_CONSTRAINTS.NAME.MAX_LENGTH,
  })
  public name: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: BLOG_VALIDATION_CONSTRAINTS.DESCRIPTION.MIN_LENGTH,
    maxlength: BLOG_VALIDATION_CONSTRAINTS.DESCRIPTION.MAX_LENGTH,
  })
  public description: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: BLOG_VALIDATION_CONSTRAINTS.WEBSITE_URL.MIN_LENGTH,
    maxlength: BLOG_VALIDATION_CONSTRAINTS.WEBSITE_URL.MAX_LENGTH,
  })
  public websiteUrl: string;

  @Prop({ type: Boolean, default: false })
  public isMembership: boolean;

  /*Явно создаем поля "createdAt" и "updatedAt" без декоратора "@Prop()", так как хоть флаг "timestamps" и создает эти
  поля в схеме и документах, но TS о них не знает.*/
  public createdAt: Date;
  public updatedAt: Date;

  @Prop({ type: Date, default: null })
  public deletedAt: Date | null;

  /*Виртуальное свойство для получения ID блога.*/
  public get id(): string {
    return (this as unknown as BlogDocumentType)._id.toString();
  }

  /*Метод для создания блога. Лучше не называть этот метод "create", чтобы TS не путал его с методом из Mongoose.*/
  public static createInstance(dto: CreateBlogDomainDTO): BlogDocumentType {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    return blog as BlogDocumentType;
  }

  /*Метод для изменения блога.*/
  public update(dto: UpdateBlogDomainDTO): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  /*Метод для soft удаления блога.*/
  public markAsDeleted(): void {
    if (this.deletedAt !== null)
      throw new DomainException({
        code: DomainExceptionCode.BlogAlreadyMarkedAsDeleted,
        message: 'Blog is already marked as deleted',
        field: '',
      });

    this.deletedAt = new Date();
  }
}

/*Создаем схему для блога на основе класса для сущности блога.*/
export const BlogSchema = SchemaFactory.createForClass(Blog);
/*Регистрируем методы класса для сущности блога в схеме для блога, то есть обычные методы класса станут методами
документа, а статические методы станут методами модели.*/
BlogSchema.loadClass(Blog);
