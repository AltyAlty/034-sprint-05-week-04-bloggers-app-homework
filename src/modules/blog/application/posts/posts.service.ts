import { Injectable } from '@nestjs/common';
import { CommentsService } from '../comments/comments.service';
import { BlogsRepository } from '../../infrastructure/blogs/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts/posts.repository';
import { BlogDb } from '../../infrastructure/blogs/types/blog-db.type';
import { PostDb } from '../../infrastructure/posts/types/post-db.type';
import { PostLikeDataDb } from '../../infrastructure/posts/types/post-like-data-db.type';
import { PostLikeStatusInputDTO } from '../../api/posts/input-dto/update-post-like-status-by-id.input-dto';
import { PostOutputDTO } from '../../api/posts/output-dto/post.output-dto';
import { PostLikeStatusOutputDTO } from '../../api/posts/output-dto/post-like-status.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { PostLikeStatusDomainDTO } from '../../domain/posts/domain-dto/post-like-status.domain-dto';
import { CreatePostForBlogDTO } from './dto/create-post-for-blog.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { UpdatePostLikeStatusByIdDTO } from './dto/update-post-like-status-by-id.dto';

/*Сервис для постов.*/
@Injectable()
export class PostsService {
  public constructor(
    private readonly commentsService: CommentsService,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository
  ) {}

  /*Метод для создания поста в блоге.*/
  public async createForBlog(dto: CreatePostForBlogDTO, blogId: string): Promise<PostOutputDTO> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
    const blog: BlogDb | null = await this.blogsRepository.findById(blogId);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhilePostCreating,
        message: 'Blog to create a post not found',
        field: 'blogId',
      });

    /*Если блог был найден, то просим репозиторий "PostsRepository" создать пост в БД.*/
    const post: PostDb | null = await this.postsRepository.create({ ...dto, blogId });
    /*Преобразовываем пост из БД в подготовленный для отправки клиенту пост и возвращаем его.*/
    return PostOutputDTO.mapFromPostDbToPostOutputDTO(post, PostLikeStatusOutputDTO.None, []);
  }

  /*Метод для изменения поста по ID.*/
  public async updateById(id: string, dto: UpdatePostDTO): Promise<void> {
    /*Проверяем существование блога.*/
    if (dto.blogId) {
      /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
      const blog: BlogDb | null = await this.blogsRepository.findById(dto.blogId);

      /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
      if (!blog) {
        throw new DomainException({
          code: DomainExceptionCode.BlogNotFoundWhilePostUpdating,
          message: 'Blog to update post not found',
          field: 'blogId',
        });
      }
    }

    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: PostDb | null = await this.postsRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileUpdating,
        message: 'Post to update not found',
        field: 'id',
      });

    /*Если пост был найден, то просим репозиторий "PostsRepository" изменить его в БД.*/
    await this.postsRepository.updateById(id, dto);
  }

  /*Метод для изменения статус лайка поста по ID поста.*/
  public async updatePostLikeStatusById(
    id: string,
    dto: UpdatePostLikeStatusByIdDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: PostDb | null = await this.postsRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileUpdatingLikeStatus,
        message: 'Post to update like status not found',
        field: 'id',
      });
    }

    /*Получаем ID блога, в котором находиться пост.*/
    const blogId: string = post.blog_id;
    /*Получаем ID пользователя.*/
    const userId: string = userAccessJwtAuthContext.id;
    /*Получаем статус лайка поста.*/
    const likeStatus: PostLikeStatusInputDTO = dto.likeStatus;

    /*Если пост был найден, то просим репозиторий "PostsRepository" найти данные о лайке для поста по ID поста и ID
    пользователя в БД.*/
    const postLikeData: PostLikeDataDb | null = await this.postsRepository.findPostLikeDataByPostIdAndUserId(
      id,
      userId
    );

    /*Если пользователь пытается установить повторный статус лайка, то ничего не делаем.*/
    if (
      (postLikeData && postLikeData.like_status === (likeStatus as unknown as PostLikeStatusDomainDTO)) ||
      (!postLikeData && likeStatus === PostLikeStatusInputDTO.None)
    ) {
      return;
    }

    /*Если пользователь хочет убрать лайк/дизлайк.*/
    if (likeStatus === PostLikeStatusInputDTO.None) {
      /*Просим репозиторий "PostsRepository" hard удалить данные о лайке поста по ID поста и ID пользователя в БД.*/
      await this.postsRepository.deletePostLikeDataByPostIdAndUserId(id, userId);

      /*Просим репозиторий "PostsRepository" изменить количество лайков и дизлайков у поста в БД:
      1. Если уже стоял лайк, то уменьшить количество лайков на 1.
      2. Если уже стоял дизлайк, то уменьшить количество дизлайков на 1.*/
      if (postLikeData?.like_status === PostLikeStatusDomainDTO.Like) {
        await this.postsRepository.updatePostLikesCountById(id, { likesCount: -1, dislikesCount: 0 });
      } else {
        await this.postsRepository.updatePostLikesCountById(id, { likesCount: 0, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить лайк.*/
    if (likeStatus === PostLikeStatusInputDTO.Like) {
      /*Если еще не был поставлен лайк/дизлайк.*/
      if (!postLikeData) {
        /*Просим репозиторий "PostsRepository" создать данные о лайке поста в БД.*/
        await this.postsRepository.createPostLikeData({
          postId: id,
          blogId,
          userId,
          likeStatus: likeStatus as unknown as PostLikeStatusDomainDTO,
        });

        /*Просим репозиторий "PostsRepository" изменить количество лайков и дизлайков у поста в БД:
        1. Увеличить количество лайков на 1.
        2. Не менять количество дизлайков.*/
        await this.postsRepository.updatePostLikesCountById(id, { likesCount: 1, dislikesCount: 0 });
        /*Если уже стоял дизлайк.*/
      } else if (postLikeData.like_status === PostLikeStatusDomainDTO.Dislike) {
        /*Просим репозиторий "PostsRepository" изменить данные о лайке поста в БД.*/
        await this.postsRepository.updatePostLikeDataByPostIdAndUserId(
          id,
          userId,
          likeStatus as unknown as PostLikeStatusDomainDTO
        );

        /*Просим репозиторий "PostsRepository" изменить количество лайков и дизлайков у поста в БД:
        1. Увеличить количество лайков на 1.
        2. Уменьшить количество дизлайков на 1.*/
        await this.postsRepository.updatePostLikesCountById(id, { likesCount: 1, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить дизлайк.*/
    if (likeStatus === PostLikeStatusInputDTO.Dislike) {
      /*Если еще не был поставлен лайк/дизлайк.*/
      if (!postLikeData) {
        /*Просим репозиторий "PostsRepository" создать данные о лайке поста в БД.*/
        await this.postsRepository.createPostLikeData({
          postId: id,
          blogId,
          userId,
          likeStatus: likeStatus as unknown as PostLikeStatusDomainDTO,
        });

        /*Просим репозиторий "PostsRepository" изменить количество лайков и дизлайков у поста в БД:
        1. Не менять количество лайков.
        2. Увеличить количество дизлайков на 1.*/
        await this.postsRepository.updatePostLikesCountById(id, { likesCount: 0, dislikesCount: 1 });
        /*Если уже стоял лайк.*/
      } else if (postLikeData?.like_status === PostLikeStatusDomainDTO.Like) {
        /*Просим репозиторий "PostsRepository" изменить данные о лайке поста в БД.*/
        await this.postsRepository.updatePostLikeDataByPostIdAndUserId(
          id,
          userId,
          likeStatus as unknown as PostLikeStatusDomainDTO
        );

        /*Просим репозиторий "PostsRepository" изменить количество лайков и дизлайков у поста в БД:
        1. Уменьшить количество лайков на 1.
        2. Увеличить количество дизлайков на 1.*/
        await this.postsRepository.updatePostLikesCountById(id, { likesCount: -1, dislikesCount: 1 });
      }
    }
  }

  /*Метод для soft удаления поста по ID.*/
  public async markAsDeletedById(id: string, blogId?: string): Promise<void> {
    /*Если был указан ID блога, то проверяем его существование.*/
    if (blogId) {
      /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
      const blog: BlogDb | null = await this.blogsRepository.findById(blogId);

      /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
      if (!blog)
        throw new DomainException({
          code: DomainExceptionCode.BlogNotFoundWhilePostDeleting,
          message: 'Blog to delete a post not found',
          field: 'blogId',
        });
    }

    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: PostDb | null = await this.postsRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileDeleting,
        message: 'Post to delete not found',
        field: 'id',
      });

    /*Если пост был найден, то просим сервис "CommentsService" soft удалить комментарии по ID поста.*/
    await this.commentsService.markAllAsDeletedByPostId(id);
    /*Просим репозиторий "PostsRepository" soft удалить данные о лайках поста по ID поста в БД.*/
    await this.postsRepository.markAllPostLikeDataAsDeletedByPostId(id);
    /*Просим репозиторий "PostsRepository" soft удалить пост по ID в БД.*/
    await this.postsRepository.markAsDeletedById(id);
  }

  /*Метод для hard удаления поста по ID.*/
  public async deleteById(id: string, blogId?: string): Promise<void> {
    /*Если был указан ID блога, то проверяем его существование.*/
    if (blogId) {
      /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
      const blog: BlogDb | null = await this.blogsRepository.findById(blogId);

      /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
      if (!blog)
        throw new DomainException({
          code: DomainExceptionCode.BlogNotFoundWhilePostDeleting,
          message: 'Blog to delete a post not found',
          field: 'blogId',
        });
    }

    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: PostDb | null = await this.postsRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileDeleting,
        message: 'Post to delete not found',
        field: 'id',
      });

    /*Если пост был найден, то просим сервис "CommentsService" hard удалить комментарии по ID поста.*/
    await this.commentsService.deleteAllByPostId(id);
    /*Просим репозиторий "PostsRepository" hard удалить данные о лайках поста по ID поста в БД.*/
    await this.postsRepository.deleteAllPostLikeDataByPostId(id);
    /*Просим репозиторий "PostsRepository" hard удалить пост по ID в БД.*/
    await this.postsRepository.deleteById(id);
  }

  /*Метод для soft удаления постов по ID блога.*/
  public async markAllAsDeletedByBlogId(id: string): Promise<void> {
    /*Просим репозиторий "CommentsService" soft удалить комментарии по ID блога.*/
    await this.commentsService.markAllAsDeletedByBlogId(id);
    /*Просим репозиторий "PostsRepository" soft удалить данные о лайках постов по ID блога в БД.*/
    await this.postsRepository.markAllPostLikeDataAsDeletedByBlogId(id);
    /*Просим репозиторий "PostsRepository" soft удалить посты по ID блога в БД.*/
    await this.postsRepository.markAllAsDeleteByBlogId(id);
  }

  /*Метод для hard удаления постов по ID блога.*/
  public async deleteAllByBlogId(id: string): Promise<void> {
    /*Просим репозиторий "CommentsService" hard удалить комментарии по ID блога.*/
    await this.commentsService.deleteAllByBlogId(id);
    /*Просим репозиторий "PostsRepository" hard удалить данные о лайках постов по ID блога в БД.*/
    await this.postsRepository.deleteAllPostLikeDataByBlogId(id);
    /*Просим репозиторий "PostsRepository" hard удалить посты по ID блога в БД.*/
    await this.postsRepository.deleteAllByBlogId(id);
  }
}
