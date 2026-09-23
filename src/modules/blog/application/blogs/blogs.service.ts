import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostsService } from '../posts/posts.service';
import { BlogsRepository } from '../../infrastructure/blogs/blogs.repository';
import { BlogOutputDTO } from '../../api/blogs/output-dto/blog.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { Blog } from '../../domain/blogs/blog.entity';
import { BlogDocumentType } from '../../domain/blogs/document-types/blog.document-type';
/*Импортируем "BlogModelType" как тип, чтобы TS не использовал его в JS-коде.*/
import type { BlogModelType } from '../../domain/blogs/model-types/blog.model-type';
import { CreateBlogDTO } from './dto/create-blog.dto';
import { UpdateBlogDTO } from './dto/update-blog.dto';

/*Сервис для блогов.*/
@Injectable()
export class BlogsService {
  public constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
    private readonly postsService: PostsService,
    private readonly blogsRepository: BlogsRepository
  ) {}

  /*Метод для создания блога.*/
  public async create(dto: CreateBlogDTO): Promise<BlogOutputDTO> {
    /*Просим модель "BlogModel" создать блог.*/
    const blog: BlogDocumentType = this.blogModel.createInstance(dto);
    /*Просим репозиторий "BlogsRepository" сохранить блог в БД.*/
    await this.blogsRepository.save(blog);
    /*Преобразовываем блог из БД в подготовленный для отправки клиенту блог и возвращаем его.*/
    return BlogOutputDTO.mapFromBlogDocumentTypeToBlogOutputDTO(blog);
  }

  /*Метод для изменения блога по ID.*/
  public async updateById(id: string, dto: UpdateBlogDTO): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID в БД.*/
    const blog: BlogDocumentType | null = await this.blogsRepository.findById(id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhileUpdating,
        message: 'Blog to update not found',
        field: 'id',
      });

    /*Если блог был найден, то изменяем его.*/
    blog.update(dto);
    /*Просим репозиторий "BlogsRepository" сохранить измененный блог.*/
    await this.blogsRepository.save(blog);
  }

  /*Метод для soft удаления блога по ID.*/
  public async markAsDeletedById(id: string): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID в БД.*/
    const blog: BlogDocumentType | null = await this.blogsRepository.findById(id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhileDeleting,
        message: 'Blog to delete not found',
        field: 'id',
      });

    /*Если блог был найден, то помечаем его как удаленный.*/
    blog.markAsDeleted();
    /*Просим репозиторий "BlogsRepository" сохранить удаленный блог.*/
    await this.blogsRepository.save(blog);
  }

  /*Метод для hard удаления блога по ID.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID в БД.*/
    const blog: BlogDocumentType | null = await this.blogsRepository.findById(id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhileDeleting,
        message: 'Blog to delete not found',
        field: 'id',
      });

    /*Просим сервис "PostsService" удалить посты по ID блога.*/
    await this.postsService.deleteAllByBlogId(id);
    /*Если блог был найден, то просим репозиторий "BlogsRepository" удалить блог по ID в БД.*/
    await this.blogsRepository.deleteById(id);
  }
}
