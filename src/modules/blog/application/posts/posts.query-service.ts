import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/blogs/blogs.query-repository';
import { PostsQueryRepository } from '../../infrastructure/posts/posts.query-repository';
import { GetPostListQueryInputDTO } from '../../api/posts/input-dto/query/get-post-list-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { NewestPostLikeListOutputDTO } from '../../api/posts/output-dto/newest-post-like-list.output-dto';
import { PostOutputDTO } from '../../api/posts/output-dto/post.output-dto';
import { PostLikeStatusOutputDTO } from '../../api/posts/output-dto/post-like-status.output-dto';
import { PostListOutputDTO } from '../../api/posts/output-dto/post-list.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { BlogDocumentType } from '../../domain/blogs/document-types/blog.document-type';
import { PostDocumentType } from '../../domain/posts/document-types/post.document-type';
import { PostLikeDataDocumentType } from '../../domain/posts/document-types/post-like-data.document-type';
import { PostListDocumentType } from '../../domain/posts/document-types/post-list.document-type';

/*Query-сервис для постов.*/
@Injectable()
export class PostsQueryService {
  public constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository
  ) {}

  /*Метод для поиска поста по ID.*/
  public async findById(id: string, userId?: string): Promise<PostOutputDTO> {
    /*Просим query-репозиторий "PostsQueryRepository" найти пост по ID в БД.*/
    const post: PostDocumentType | null = await this.postsQueryRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({ code: DomainExceptionCode.PostNotFound, message: 'Post not found', field: 'id' });

    /*Если пост был найден, то формируем статус лайка поста.*/
    let likeStatus: PostLikeStatusOutputDTO = PostLikeStatusOutputDTO.None;

    /*Если в запросе был указан AT.*/
    if (userId) {
      /*Просим query-репозиторий "PostsQueryRepository" найти данные о лайке поста в БД.*/
      const postLikeData: PostLikeDataDocumentType | null =
        await this.postsQueryRepository.findPostLikeDataByPostIdAndUserId(id, userId);

      /*Если данные о лайке поста были найдены, то получаем статус лайка.*/
      if (postLikeData) likeStatus = postLikeData.likeStatus as unknown as PostLikeStatusOutputDTO;
    }

    /*Просим query-репозиторий "PostsQueryRepository" найти данные о трех последних лайках поста по ID поста в БД.*/
    const newestLikes: NewestPostLikeListOutputDTO = await this.postsQueryRepository.findLastThreePostLikes(id);
    /*Преобразовываем пост из БД в подготовленный для отправки клиенту пост и возвращаем его.*/
    return PostOutputDTO.mapFromPostDocumentTypeToPostOutputDTO(post, likeStatus, newestLikes);
  }

  /*Метод для поиска постов.*/
  public async findAll(
    dto: GetPostListQueryInputDTO,
    blogId?: string,
    userId?: string
  ): Promise<PaginationMetaDataOutputDTO<PostListOutputDTO>> {
    /*Если был указан ID блога, то просим query-репозиторий "BlogsQueryRepository" найти блог по ID.*/
    if (blogId) {
      const blog: BlogDocumentType | null = await this.blogsQueryRepository.findById(blogId);

      /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
      if (!blog)
        throw new DomainException({
          code: DomainExceptionCode.BlogNotFoundWhilePostSearching,
          message: 'Blog to find posts not found',
          field: 'blogId',
        });
    }

    /*Просим query-репозиторий "PostsQueryRepository" найти посты в БД.*/
    const { items, totalCount }: { items: PostListDocumentType; totalCount: number } =
      await this.postsQueryRepository.findAll(dto, blogId);

    /*Преобразовываем посты из БД в подготовленные для отправки клиенту посты.*/
    const postListOutput: PostListOutputDTO = await PostOutputDTO.mapFromPostListDocumentTypeToPostListOutputDTO(
      items,
      this.postsQueryRepository,
      userId
    );

    /*Преобразовываем подготовленные для отправки клиенту посты в подготовленные для отправки клиенту с пагинацией
    посты и возвращаем их.*/
    return PaginationMetaDataOutputDTO.mapToOutputDTO({
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: totalCount,
      items: postListOutput,
    });
  }
}
