import { ApiProperty } from '@nestjs/swagger';
import { PostsQueryRepository } from '../../../infrastructure/posts/posts.query-repository';
import { PostsPostgresqlQueryRepository } from '../../../infrastructure/posts/posts-postgresql.query-repository';
import {
  PostLikeDataListPostgresqlDb,
  PostLikeDataPostgresqlDb,
} from '../../../infrastructure/posts/postgresql-types/post-like-data-postgresql-db.type';
import {
  PostListPostgresqlDb,
  PostPostgresqlDb,
} from '../../../infrastructure/posts/postgresql-types/post-postgresql-db.type';
import { ExtendedLikesInfoOutputDTO } from './extended-likes-info.output-dto';
import { NewestPostLikeOutputDTO } from './newest-post-like.output-dto';
import { NewestPostLikeListOutputDTO } from './newest-post-like-list.output-dto';
import { PostLikeStatusOutputDTO } from './post-like-status.output-dto';
import { PostListOutputDTO } from './post-list.output-dto';
import { PostDocumentType } from '../../../domain/posts/document-types/post.document-type';
import { PostLikeDataDocumentType } from '../../../domain/posts/document-types/post-like-data.document-type';
import { PostLikeDataListDocumentType } from '../../../domain/posts/document-types/post-like-data-list.document-type';
import { PostListDocumentType } from '../../../domain/posts/document-types/post-list.document-type';

/*Output DTO для поста.*/
export class PostOutputDTO {
  @ApiProperty({ example: '60d5ec386f6e5a1b3c9d4e2a', description: 'Post ID' })
  public id: string;

  @ApiProperty({ example: 'postTitle', description: 'Post title' })
  public title: string;

  @ApiProperty({ example: 'shortPostDescription', description: 'Short post description' })
  public shortDescription: string;

  @ApiProperty({ example: 'postContent', description: 'Post content' })
  public content: string;

  @ApiProperty({ example: '60d5ec386f6e5a1b3c9d4e2a', description: 'ID of the blog that contains the post' })
  public blogId: string;

  @ApiProperty({ example: 'blogName', description: 'Name of the blog that contains the post' })
  public blogName: string;

  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'Post creation date' })
  public createdAt: Date;

  @ApiProperty({ description: 'Post likes data' })
  public extendedLikesInfo: ExtendedLikesInfoOutputDTO;

  /*Маппер для преобразования поста из БД в подготовленный для отправки клиенту пост.*/
  public static mapFromPostDocumentTypeToPostOutputDTO(
    post: PostDocumentType,
    likeStatus: PostLikeStatusOutputDTO,
    newestLikes: NewestPostLikeListOutputDTO
  ): PostOutputDTO {
    const postOutputDTO: PostOutputDTO = new PostOutputDTO();
    postOutputDTO.id = post._id.toString();
    postOutputDTO.title = post.title;
    postOutputDTO.shortDescription = post.shortDescription;
    postOutputDTO.content = post.content;
    postOutputDTO.blogId = post.blogId;
    postOutputDTO.blogName = post.blogName;
    postOutputDTO.createdAt = post.createdAt;

    postOutputDTO.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      myStatus: likeStatus,
      newestLikes: newestLikes.map((postLikeData: NewestPostLikeOutputDTO) => ({
        addedAt: postLikeData.addedAt,
        userId: postLikeData.userId,
        login: postLikeData.login,
      })),
    };

    return postOutputDTO;
  }

  /*Маппер для преобразования постов из БД в подготовленные для отправки клиенту посты. Использование здесь репозитория
  нарушает DDD - лучше логику этого маппера делать в сервисах.*/
  public static async mapFromPostListDocumentTypeToPostListOutputDTO(
    posts: PostListDocumentType,
    postsQueryRepository: PostsQueryRepository,
    userId: string | undefined
  ): Promise<PostListOutputDTO> {
    /*Если в виде постов был передан пустой массив, то возвращаем пустой массив.*/
    if (posts.length === 0) return [];
    /*Получаем ID постов.*/
    const postIds: string[] = posts.map((post: PostDocumentType): string => post._id.toString());
    /*Создаем Map формата "postId: likeStatus", чтобы избежать многочисленных запросов в БД для получения статусов
    лайков пользователя каждого поста.*/
    let postLikesDataMap: Map<string, PostLikeStatusOutputDTO> = new Map<string, PostLikeStatusOutputDTO>();

    /*Если был передан ID пользователя, то получаем статусы лайков пользователя каждого поста.*/
    if (userId) {
      /*Просим query-репозиторий "PostsQueryRepository" найти данные о лайках постов по ID постов и ID пользователя в
      БД.*/
      const postLikesData: PostLikeDataListDocumentType =
        await postsQueryRepository.findAllPostLikesDataByPostIdsAndUserId(postIds, userId);

      /*Заполняем Map статусами лайков пользователя каждого поста, не обращаясь в БД.*/
      postLikesDataMap = new Map(
        postLikesData.map((postLikeData: PostLikeDataDocumentType): [string, PostLikeStatusOutputDTO] => [
          postLikeData.postId,
          postLikeData.likeStatus as unknown as PostLikeStatusOutputDTO,
        ])
      );
    }

    /*Создаем Map формата "postId: PostLikeDataListDocumentType", чтобы избежать многочисленных запросов в БД для
    получения данных о трех последних лайках каждого поста.*/
    const newestLikesMap: Map<string, NewestPostLikeListOutputDTO> =
      /*Просим query-репозиторий "PostsQueryRepository" найти данные о трех последних лайках постов по ID постов в БД.*/
      await postsQueryRepository.findLastThreeLikesForPostsByPostIds(postIds);

    /*Формируем массив подготовленных для отправки клиенту постов.*/
    return posts.map((post: PostDocumentType): PostOutputDTO => {
      /*Получаем ID поста.*/
      const postId: string = post._id.toString();
      /*Получаем статус лайка поста.*/
      const likeStatus: PostLikeStatusOutputDTO = postLikesDataMap.get(postId) ?? PostLikeStatusOutputDTO.None;
      /*Получаем данные о трех последних лайках поста.*/
      const newestLikes: NewestPostLikeListOutputDTO = newestLikesMap.get(postId) ?? [];
      /*Преобразовываем пост из БД в подготовленный для отправки клиенту пост.*/
      return this.mapFromPostDocumentTypeToPostOutputDTO(post, likeStatus, newestLikes);
    });
  }

  /*Маппер для преобразования поста из БД в подготовленный для отправки клиенту пост.*/
  public static mapFromPostPostgresqlDbToPostOutputDTO(
    post: PostPostgresqlDb,
    likeStatus: PostLikeStatusOutputDTO,
    newestLikes: NewestPostLikeListOutputDTO
  ): PostOutputDTO {
    const postOutputDTO: PostOutputDTO = new PostOutputDTO();
    postOutputDTO.id = post.id;
    postOutputDTO.title = post.title;
    postOutputDTO.shortDescription = post.short_description;
    postOutputDTO.content = post.content;
    postOutputDTO.blogId = post.blog_id;
    postOutputDTO.blogName = post.blog_name;
    postOutputDTO.createdAt = post.created_at;

    postOutputDTO.extendedLikesInfo = {
      likesCount: post.likes_count,
      dislikesCount: post.dislikes_count,
      myStatus: likeStatus,
      newestLikes: newestLikes.map((postLikeData: NewestPostLikeOutputDTO) => ({
        addedAt: postLikeData.addedAt,
        userId: postLikeData.userId,
        login: postLikeData.login,
      })),
    };

    return postOutputDTO;
  }

  /*Маппер для преобразования постов из БД в подготовленные для отправки клиенту посты. Использование здесь репозитория
  нарушает DDD - лучше логику этого маппера делать в сервисах.*/
  public static async mapFromPostListPostgresqlDbToPostListOutputDTO(
    posts: PostListPostgresqlDb,
    postsQueryRepository: PostsPostgresqlQueryRepository,
    userId: string | undefined
  ): Promise<PostListOutputDTO> {
    /*Если в виде постов был передан пустой массив, то возвращаем пустой массив.*/
    if (posts.length === 0) return [];
    /*Получаем ID постов.*/
    const postIds: string[] = posts.map((post: PostPostgresqlDb): string => post.id);
    /*Создаем Map формата "postId: likeStatus", чтобы избежать многочисленных запросов в БД для получения статусов
    лайков пользователя каждого поста.*/
    let postLikesDataMap: Map<string, PostLikeStatusOutputDTO> = new Map<string, PostLikeStatusOutputDTO>();

    /*Если был передан ID пользователя, то получаем статусы лайков пользователя каждого поста.*/
    if (userId) {
      /*Просим query-репозиторий "PostsQueryRepository" найти данные о лайках постов по ID постов и ID пользователя в
      БД.*/
      const postLikesData: PostLikeDataListPostgresqlDb =
        await postsQueryRepository.findAllPostLikesDataByPostIdsAndUserId(postIds, userId);

      /*Заполняем Map статусами лайков пользователя каждого поста, не обращаясь в БД.*/
      postLikesDataMap = new Map(
        postLikesData.map((postLikeData: PostLikeDataPostgresqlDb): [string, PostLikeStatusOutputDTO] => [
          postLikeData.post_id,
          postLikeData.like_status as unknown as PostLikeStatusOutputDTO,
        ])
      );
    }

    /*Создаем Map формата "postId: PostLikeDataListDocumentType", чтобы избежать многочисленных запросов в БД для
    получения данных о трех последних лайках каждого поста.*/
    const newestLikesMap: Map<string, NewestPostLikeListOutputDTO> =
      /*Просим query-репозиторий "PostsQueryRepository" найти данные о трех последних лайках постов по ID постов в БД.*/
      await postsQueryRepository.findLastThreeLikesForPostsByPostIds(postIds);

    /*Формируем массив подготовленных для отправки клиенту постов.*/
    return posts.map((post: PostPostgresqlDb): PostOutputDTO => {
      /*Получаем ID поста.*/
      const postId: string = post.id;
      /*Получаем статус лайка поста.*/
      const likeStatus: PostLikeStatusOutputDTO = postLikesDataMap.get(postId) ?? PostLikeStatusOutputDTO.None;
      /*Получаем данные о трех последних лайках поста.*/
      const newestLikes: NewestPostLikeListOutputDTO = newestLikesMap.get(postId) ?? [];
      /*Преобразовываем пост из БД в подготовленный для отправки клиенту пост.*/
      return this.mapFromPostPostgresqlDbToPostOutputDTO(post, likeStatus, newestLikes);
    });
  }
}
