import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsService } from '../comments/comments.service';
import { BlogsRepository } from '../../infrastructure/blogs/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts/posts.repository';
import { PostLikeStatusInputDTO } from '../../api/posts/input-dto/update-post-like-status-by-id.input-dto';
import { PostOutputDTO } from '../../api/posts/output-dto/post.output-dto';
import { PostLikeStatusOutputDTO } from '../../api/posts/output-dto/post-like-status.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { BlogDocumentType } from '../../domain/blogs/document-types/blog.document-type';
import { PostDocumentType } from '../../domain/posts/document-types/post.document-type';
import { PostLikeDataDocumentType } from '../../domain/posts/document-types/post-like-data.document-type';
import { PostLikeStatusDomainDTO } from '../../domain/posts/domain-dto/post-like-status.domain-dto';
import type { PostModelType } from '../../domain/posts/model-types/post.model-type';
import type { PostLikeDataModelType } from '../../domain/posts/model-types/post-like-data.model-type';
import { Post } from '../../domain/posts/post.entity';
import { PostLikeData } from '../../domain/posts/post-like-data.entity';
import { CreatePostDTO } from './dto/create-post.dto';
import { CreatePostForBlogDTO } from './dto/create-post-for-blog.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { UpdatePostLikeStatusByIdDTO } from './dto/update-post-like-status-by-id.dto';

/*Сервис для постов.*/
@Injectable()
export class PostsService {
  public constructor(
    @InjectModel(Post.name)
    private readonly postModel: PostModelType,
    @InjectModel(PostLikeData.name) private readonly postLikeDataModel: PostLikeDataModelType,
    private readonly commentsService: CommentsService,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository
  ) {}

  /*Метод для создания поста.*/
  public async create(dto: CreatePostDTO): Promise<PostOutputDTO> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
    const blog: BlogDocumentType | null = await this.blogsRepository.findById(dto.blogId);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhilePostCreating,
        message: 'Blog to create a post not found',
        field: 'blogId',
      });

    /*Если блог был найден, то просим модель "PostModel" создать пост.*/
    const post: PostDocumentType = this.postModel.createInstance({ ...dto, blogName: blog.name });
    /*Просим репозиторий "PostsRepository" сохранить пост в БД.*/
    await this.postsRepository.save(post);
    /*Преобразовываем пост из БД в подготовленный для отправки клиенту пост и возвращаем его.*/
    return PostOutputDTO.mapFromPostDocumentTypeToPostOutputDTO(post, PostLikeStatusOutputDTO.None, []);
  }

  /*Метод для создания поста в блоге.*/
  public async createForBlog(dto: CreatePostForBlogDTO, blogId: string): Promise<PostOutputDTO> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
    const blog: BlogDocumentType | null = await this.blogsRepository.findById(blogId);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhilePostCreating,
        message: 'Blog to create a post not found',
        field: 'blogId',
      });

    /*Если блог был найден, то просим модель "PostModel" создать пост в блоге.*/
    const post: PostDocumentType = this.postModel.createInstance({ ...dto, blogId, blogName: blog.name });
    /*Просим репозиторий "PostsRepository" сохранить пост в БД.*/
    await this.postsRepository.save(post);
    /*Преобразовываем пост из БД в подготовленный для отправки клиенту пост и возвращаем его.*/
    return PostOutputDTO.mapFromPostDocumentTypeToPostOutputDTO(post, PostLikeStatusOutputDTO.None, []);
  }

  /*Метод для изменения поста по ID.*/
  public async updateById(id: string, dto: UpdatePostDTO): Promise<void> {
    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: PostDocumentType | null = await this.postsRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileUpdating,
        message: 'Post to update not found',
        field: 'id',
      });

    /*Если пост был найден, то изменяем его.*/
    post.update(dto);
    /*Просим репозиторий "PostsRepository" сохранить измененный пост.*/
    await this.postsRepository.save(post);
  }

  /*Метод для изменения статус лайка поста по ID поста.*/
  public async updatePostLikeStatusById(
    id: string,
    dto: UpdatePostLikeStatusByIdDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: PostDocumentType | null = await this.postsRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileUpdatingLikeStatus,
        message: 'Post to update like status not found',
        field: 'id',
      });
    }

    /*Получаем ID блога, в котором находиться пост.*/
    const blogId: string = post.blogId;

    /*Если пост был найден, то просим репозиторий "PostsRepository" найти данные о лайке для поста по ID поста и ID
    пользователя в БД.*/
    const postLikeData: PostLikeDataDocumentType | null = await this.postsRepository.findPostLikeDataByPostIdAndUserId(
      id,
      userAccessJwtAuthContext.id
    );

    /*Если пользователь пытается установить повторный статус лайка, то ничего не делаем.*/
    if (
      (postLikeData && postLikeData.likeStatus === (dto.likeStatus as unknown as PostLikeStatusDomainDTO)) ||
      (!postLikeData && dto.likeStatus === PostLikeStatusInputDTO.None)
    ) {
      return;
    }

    /*Если пользователь хочет убрать лайк/дизлайк.*/
    if (dto.likeStatus === PostLikeStatusInputDTO.None) {
      /*Просим репозиторий "PostsRepository" удалить данные о лайке поста по ID поста и ID пользователя в БД.*/
      await this.postsRepository.deletePostLikeDataByPostIdAndUserId(id, userAccessJwtAuthContext.id);

      /*Изменяем количество лайков и дизлайков у поста в БД:
      1. Если уже стоял лайк, то уменьшить количество лайков на 1.
      2. Если уже стоял дизлайк, то уменьшить количество дизлайков на 1.*/
      if (postLikeData?.likeStatus === PostLikeStatusDomainDTO.Like) {
        post.updatePostLikesCount({ likesCount: -1, dislikesCount: 0 });
      } else {
        post.updatePostLikesCount({ likesCount: 0, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить лайк.*/
    if (dto.likeStatus === PostLikeStatusInputDTO.Like) {
      /*Если еще не был поставлен лайк/дизлайк.*/
      if (!postLikeData) {
        /*Просим модель "PostLikeDataModel" создать данные о лайке поста в БД.*/
        const postLikeData: PostLikeDataDocumentType = this.postLikeDataModel.createInstance({
          postId: id,
          blogId,
          userId: userAccessJwtAuthContext.id,
          login: userAccessJwtAuthContext.login,
          likeStatus: dto.likeStatus as unknown as PostLikeStatusDomainDTO,
        });

        /*Просим репозиторий "PostsRepository" сохранить данные о лайке поста в БД.*/
        await this.postsRepository.savePostLikeData(postLikeData);
        /*Изменяем количество лайков и дизлайков у поста в БД:
        1. Увеличить количество лайков на 1.
        2. Не менять количество дизлайков.*/
        post.updatePostLikesCount({ likesCount: 1, dislikesCount: 0 });
        /*Если уже стоял дизлайк.*/
      } else if (postLikeData.likeStatus === PostLikeStatusDomainDTO.Dislike) {
        /*Изменяем данные о лайке поста в БД.*/
        postLikeData.update({ likeStatus: dto.likeStatus as unknown as PostLikeStatusDomainDTO });
        /*Просим репозиторий "PostsRepository" сохранить данные о лайке поста в БД.*/
        await this.postsRepository.savePostLikeData(postLikeData);
        /*Изменяем количество лайков и дизлайков у поста в БД:
        1. Увеличить количество лайков на 1.
        2. Уменьшить количество дизлайков на 1.*/
        post.updatePostLikesCount({ likesCount: 1, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить дизлайк.*/
    if (dto.likeStatus === PostLikeStatusInputDTO.Dislike) {
      /*Если еще не был поставлен лайк/дизлайк.*/
      if (!postLikeData) {
        /*Просим модель "PostLikeDataModel" создать данные о лайке поста в БД.*/
        const postLikeData: PostLikeDataDocumentType = this.postLikeDataModel.createInstance({
          postId: id,
          blogId,
          userId: userAccessJwtAuthContext.id,
          login: userAccessJwtAuthContext.login,
          likeStatus: dto.likeStatus as unknown as PostLikeStatusDomainDTO,
        });

        /*Просим репозиторий "PostsRepository" сохранить данные о лайке поста в БД.*/
        await this.postsRepository.savePostLikeData(postLikeData);
        /*Изменяем количество лайков и дизлайков у поста в БД:
        1. Не менять количество лайков.
        2. Увеличить количество дизлайков на 1.*/
        post.updatePostLikesCount({ likesCount: 0, dislikesCount: 1 });
        /*Если уже стоял лайк.*/
      } else if (postLikeData?.likeStatus === PostLikeStatusDomainDTO.Like) {
        /*Изменяем данные о лайке поста в БД.*/
        postLikeData.update({ likeStatus: dto.likeStatus as unknown as PostLikeStatusDomainDTO });
        /*Просим репозиторий "PostsRepository" сохранить данные о лайке поста в БД.*/
        await this.postsRepository.savePostLikeData(postLikeData);
        /*Изменяем количество лайков и дизлайков у поста в БД:
        1. Уменьшить количество лайков на 1.
        2. Увеличить количество дизлайков на 1.*/
        post.updatePostLikesCount({ likesCount: -1, dislikesCount: 1 });
      }
    }

    /*Просим репозиторий "PostsRepository" сохранить пост в БД.*/
    await this.postsRepository.save(post);
  }

  /*Метод для soft удаления поста по ID.*/
  public async markAsDeletedById(id: string): Promise<void> {
    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: PostDocumentType | null = await this.postsRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileDeleting,
        message: 'Post to delete not found',
        field: 'id',
      });

    /*Если пост был найден, то помечаем его как удаленный.*/
    post.markAsDeleted();
    /*Просим репозиторий "PostsRepository" сохранить удаленный пост.*/
    await this.postsRepository.save(post);
  }

  /*Метод для hard удаления поста по ID.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: PostDocumentType | null = await this.postsRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileDeleting,
        message: 'Post to delete not found',
        field: 'id',
      });

    /*Если пост был найден, то просим сервис "CommentsService" удалить комментарии по ID поста.*/
    await this.commentsService.deleteAllByPostId(id);
    /*Просим репозиторий "PostsRepository" удалить данные о лайках поста по ID поста в БД.*/
    await this.postsRepository.deleteAllPostLikeDataByPostId(id);
    /*Просим репозиторий "PostsRepository" удалить пост по ID в БД.*/
    await this.postsRepository.deleteById(id);
  }

  /*Метод для hard удаления постов по ID блога.*/
  public async deleteAllByBlogId(id: string): Promise<void> {
    /*Просим репозиторий "CommentsService" удалить комментарии по ID блога.*/
    await this.commentsService.deleteAllByBlogId(id);
    /*Просим репозиторий "PostsRepository" удалить данные о лайках постов по ID блога в БД.*/
    await this.postsRepository.deleteAllPostLikeDataByBlogId(id);
    /*Просим репозиторий "PostsRepository" удалить посты по ID блога в БД.*/
    await this.postsRepository.deleteAllByBlogId(id);
  }
}
