import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';
import { GetPostListQueryInputDTO } from '../../api/posts/input-dto/query/get-post-list-query.input-dto';
import { NewestPostLikeListOutputDTO } from '../../api/posts/output-dto/newest-post-like-list.output-dto';
import { PostDocumentType } from '../../domain/posts/document-types/post.document-type';
import { PostLikeDataDocumentType } from '../../domain/posts/document-types/post-like-data.document-type';
import { PostLikeDataListDocumentType } from '../../domain/posts/document-types/post-like-data-list.document-type';
import { PostListDocumentType } from '../../domain/posts/document-types/post-list.document-type';
import { PostLikeStatusDomainDTO } from '../../domain/posts/domain-dto/post-like-status.domain-dto';
import type { PostModelType } from '../../domain/posts/model-types/post.model-type';
import type { PostLikeDataModelType } from '../../domain/posts/model-types/post-like-data.model-type';
import { Post } from '../../domain/posts/post.entity';
import { PostLikeData } from '../../domain/posts/post-like-data.entity';

/*Query-репозиторий для постов.*/
@Injectable()
export class PostsQueryRepository {
  public constructor(
    @InjectModel(Post.name) private readonly postModel: PostModelType,
    @InjectModel(PostLikeData.name) private readonly postLikeDataModel: PostLikeDataModelType
  ) {}

  /*Метод для поиска поста по ID в БД.*/
  public async findById(id: string): Promise<PostDocumentType | null> {
    /*Просим модель "PostModel" найти пост по ID в БД.*/
    return await this.postModel.findOne({ _id: id, deletedAt: null });
  }

  /*Метод для поиска постов в БД.*/
  public async findAll(
    dto: GetPostListQueryInputDTO,
    blogId?: string
  ): Promise<{ items: PostListDocumentType; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();
    /*Динамически собираем фильтр для поиска в MongoDB. Начинаем с пустого фильтра если используем hard удаление, либо с
    "deletedAt: null", если используем soft удаление.*/
    const filter: QueryFilter<PostDocumentType> = { deletedAt: null };
    /*Если был указан ID блога, то добавляем его в фильтр.*/
    if (blogId) filter.blogId = blogId;

    /*Просим модель "PostModel" найти посты в БД и подсчитать общее количество документов, подходящих под фильтр, без
    учета пагинации.*/
    const [items, totalCount]: [PostListDocumentType, number] = await Promise.all([
      this.postModel
        .find(filter)
        .sort({ [dto.sortBy]: dto.sortDirection })
        .skip(skip)
        .limit(dto.pageSize),
      this.postModel.countDocuments(filter),
    ]);

    /*Возвращаем данные по постам.*/
    return { items, totalCount };
  }

  /*Метод для поиска данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async findPostLikeDataByPostIdAndUserId(
    postId: string,
    userId: string
  ): Promise<PostLikeDataDocumentType | null> {
    /*Просим модель "PostLikeDataModel" найти данные о лайке поста по ID поста и ID пользователя в БД.*/
    return await this.postLikeDataModel.findOne({ postId, userId });
  }

  /*Метод для поиска данных о лайках постов по ID постов и ID пользователя в БД.*/
  public async findAllPostLikesDataByPostIdsAndUserId(
    postIds: string[],
    userId: string
  ): Promise<PostLikeDataListDocumentType> {
    /*Просим модель "PostLikeDataModel" найти данные о лайках постов по ID постов и ID пользователя в БД.*/
    return await this.postLikeDataModel.find({ postId: { $in: postIds }, userId });
  }

  /*Метод для поиска данных о трех последних лайках поста по ID поста в БД.*/
  public async findLastThreePostLikes(postId: string): Promise<NewestPostLikeListOutputDTO> {
    /*Просим модель "PostLikeDataModel" найти данные о трех последних лайках поста по ID поста в БД.*/
    return await this.postLikeDataModel
      .find(
        { postId, likeStatus: PostLikeStatusDomainDTO.Like },
        /*Указываем какие поля включать в результат.*/
        { addedAt: 1, userId: 1, login: 1, _id: 0 }
      )
      /*Сортируем найденные данные о лайках поста по полю "addedAt" в порядке убывания.*/
      .sort({ addedAt: -1 })
      /*Ограничиваем количество возвращаемых данных о лайках поста до трех.*/
      .limit(3)
      .lean();
  }

  /*Метод для поиска данных о трех последних лайках постов по ID постов в БД.*/
  public async findLastThreeLikesForPostsByPostIds(
    postIds: string[]
  ): Promise<Map<string, NewestPostLikeListOutputDTO>> {
    /*Выполняем агрегационный конвейер MongoDB. Плюсы использования агрегационного конвейера здесь:
    1. Работа с документами происходит внутри MongoDB, без загрузки всех документов в память приложения.
    2. БД возвращает только нужные трое данных о лайках на пост (или меньше), а не все данные о лайках для всех
    запрошенных постов.
    3. При миллионе лайков у поста из БД будет браться только три документа на пост, а не миллион.*/
    const aggregationResult = await this.postLikeDataModel.aggregate<{
      _id: string;
      likes: NewestPostLikeListOutputDTO;
    }>([
      /*Берем только те данные о лайках постов, у которых ID поста входит в переданный массив ID постов и статус лайка
      установлен как "Like".*/
      { $match: { postId: { $in: postIds }, likeStatus: PostLikeStatusDomainDTO.Like } },
      /*Сортируем найденные данные о лайках постов по полю "addedAt" в порядке убывания.*/
      { $sort: { addedAt: -1 } },
      /*Создаем отдельные группы данных о лайках поста для каждого уникального ID поста. В поле "likes" собираем только
      нужные поля для типа "NewestPostLikeOutputDTO".*/
      { $group: { _id: '$postId', likes: { $push: { addedAt: '$addedAt', userId: '$userId', login: '$login' } } } },
      /*Делаем проекцию, то есть определяем структуру выходных документов. Обрезаем массив "likes" до первых трех
      элементов.*/
      { $project: { likes: { $slice: ['$likes', 3] } } },
    ]);

    /*Преобразовываем результат агрегации в Map в формате "postId: NewestPostLikeListOutputDTO".*/
    const map: Map<string, NewestPostLikeListOutputDTO> = new Map<string, NewestPostLikeListOutputDTO>();
    for (const item of aggregationResult) map.set(item._id, item.likes);
    /*Возвращаем данные о трех последних лайках постов.*/
    return map;
  }
}
