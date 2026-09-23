import { Injectable } from '@nestjs/common';
import { PostsPostgresqlService } from '../posts/posts-postgresql.service';
import { BlogsPostgresqlRepository } from '../../infrastructure/blogs/blogs-postgresql.repository';
import { BlogPostgresqlDb } from '../../infrastructure/blogs/postgresql-types/blog-postgresql-db.type';
import { BlogOutputDTO } from '../../api/blogs/output-dto/blog.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { CreateBlogDTO } from './dto/create-blog.dto';
import { UpdateBlogDTO } from './dto/update-blog.dto';

/*Сервис для блогов в PostgreSQL.*/
@Injectable()
export class BlogsPostgresqlService {
  public constructor(
    private readonly postsService: PostsPostgresqlService,
    private readonly blogsRepository: BlogsPostgresqlRepository
  ) {}

  /*Метод для создания блога.*/
  public async create(dto: CreateBlogDTO): Promise<BlogOutputDTO> {
    /*Просим репозиторий "BlogsRepository" создать блог в БД.*/
    const blog: BlogPostgresqlDb = await this.blogsRepository.create(dto);
    /*Преобразовываем блог из БД в подготовленный для отправки клиенту блог и возвращаем его.*/
    return BlogOutputDTO.mapFromBlogPostgresqlDbToBlogOutputDTO(blog);
  }

  /*Метод для изменения блога по ID.*/
  public async updateById(id: string, dto: UpdateBlogDTO): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID в БД.*/
    const blog: BlogPostgresqlDb | null = await this.blogsRepository.findById(id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhileUpdating,
        message: 'Blog to update not found',
        field: 'id',
      });

    /*Если блог был найден, то просим репозиторий "BlogsRepository" изменить его по ID в БД.*/
    await this.blogsRepository.updateById(id, dto);
  }

  /*Метод для soft удаления блога по ID.*/
  public async markAsDeletedById(id: string): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID в БД.*/
    const blog: BlogPostgresqlDb | null = await this.blogsRepository.findById(id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhileDeleting,
        message: 'Blog to delete not found',
        field: 'id',
      });

    /*Если блог был найден, то просим репозиторий "BlogsRepository" пометить его как удаленный в БД.*/
    await this.blogsRepository.markAsDeletedById(id);
  }

  /*Метод для hard удаления блога по ID.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID в БД.*/
    const blog: BlogPostgresqlDb | null = await this.blogsRepository.findById(id);

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
