import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/blogs/blogs.query-repository';
import { GetBlogListQueryInputDTO } from '../../api/blogs/input-dto/query/get-blog-list-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { BlogOutputDTO } from '../../api/blogs/output-dto/blog.output-dto';
import { BlogListOutputDTO } from '../../api/blogs/output-dto/blog-list.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { BlogDocumentType } from '../../domain/blogs/document-types/blog.document-type';
import { BlogListDocumentType } from '../../domain/blogs/document-types/blog-list.document-type';

/*Query-сервис для блогов.*/
@Injectable()
export class BlogsQueryService {
  public constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  /*Метод для поиска блога по ID.*/
  public async findById(id: string): Promise<BlogOutputDTO> {
    /*Просим query-репозиторий "BlogsQueryRepository" найти блог по ID в БД.*/
    const blog: BlogDocumentType | null = await this.blogsQueryRepository.findById(id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({ code: DomainExceptionCode.BlogNotFound, message: 'Blog not found', field: 'id' });

    /*Если блог был найден, то преобразовываем блог из БД в подготовленный для отправки клиенту блог и возвращаем его.*/
    return BlogOutputDTO.mapFromBlogDocumentTypeToBlogOutputDTO(blog);
  }

  /*Метод для поиска блогов.*/
  public async findAll(dto: GetBlogListQueryInputDTO): Promise<PaginationMetaDataOutputDTO<BlogListOutputDTO>> {
    /*Просим query-репозиторий "BlogsQueryRepository" найти блоги в БД.*/
    const { items, totalCount }: { items: BlogListDocumentType; totalCount: number } =
      await this.blogsQueryRepository.findAll(dto);

    /*Преобразовываем блоги из БД в подготовленные для отправки клиенту блоги.*/
    const blogListOutput: BlogListOutputDTO = BlogOutputDTO.mapFromBlogListDocumentTypeToBlogListOutputDTO(items);

    /*Преобразовываем подготовленные для отправки клиенту блоги в подготовленные для отправки клиенту с пагинацией
    блоги и возвращаем их.*/
    return PaginationMetaDataOutputDTO.mapToOutputDTO({
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount,
      items: blogListOutput,
    });
  }
}
