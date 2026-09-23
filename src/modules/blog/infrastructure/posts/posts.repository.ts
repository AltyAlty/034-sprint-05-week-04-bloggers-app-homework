import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostDocumentType } from '../../domain/posts/document-types/post.document-type';
import { PostLikeDataDocumentType } from '../../domain/posts/document-types/post-like-data.document-type';
import type { PostModelType } from '../../domain/posts/model-types/post.model-type';
import type { PostLikeDataModelType } from '../../domain/posts/model-types/post-like-data.model-type';
import { Post } from '../../domain/posts/post.entity';
import { PostLikeData } from '../../domain/posts/post-like-data.entity';

/*Репозиторий для постов.*/
@Injectable()
export class PostsRepository {
  public constructor(
    @InjectModel(Post.name) private readonly postModel: PostModelType,
    @InjectModel(PostLikeData.name) private readonly postLikeDataModel: PostLikeDataModelType
  ) {}

  /*Метод для сохранения поста в БД.*/
  public async save(post: PostDocumentType): Promise<void> {
    await post.save();
  }

  /*Метод для сохранения данных о лайке поста в БД.*/
  public async savePostLikeData(postLikeData: PostLikeDataDocumentType): Promise<void> {
    await postLikeData.save();
  }

  /*Метод для поиска поста по ID в БД.*/
  public async findById(id: string): Promise<PostDocumentType | null> {
    /*Просим модель "PostModel" найти пост по ID в БД.*/
    return await this.postModel.findOne({ _id: id, deletedAt: null });
  }

  /*Метод для поиска данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async findPostLikeDataByPostIdAndUserId(
    postId: string,
    userId: string
  ): Promise<PostLikeDataDocumentType | null> {
    /*Просим модель "PostLikeDataModel" найти данные о лайке поста по ID поста и ID пользователя в БД.*/
    return await this.postLikeDataModel.findOne({ postId, userId });
  }

  /*Метод для hard удаления поста по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим модель "PostModel" удалить пост по ID в БД.*/
    await this.postModel.deleteOne({ _id: id });
  }

  /*Метод для hard удаления постов по ID блога в БД.*/
  public async deleteAllByBlogId(id: string): Promise<void> {
    /*Просим модель "PostModel" удалить посты по ID блога в БД.*/
    await this.postModel.deleteMany({ blogId: id });
  }

  /*Метод для hard удаления данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async deletePostLikeDataByPostIdAndUserId(postId: string, userId: string): Promise<void> {
    /*Просим модель "PostLikeDataModel" удалить данные о лайке поста по ID поста и ID пользователя в БД.*/
    await this.postLikeDataModel.deleteOne({ postId, userId });
  }

  /*Метод для hard удаления данных о лайках поста по ID поста в БД.*/
  public async deleteAllPostLikeDataByPostId(id: string): Promise<void> {
    /*Просим модель "PostLikeDataModel" удалить данные о лайках поста по ID поста в БД.*/
    await this.postLikeDataModel.deleteMany({ postId: id });
  }

  /*Метод для hard удаления данных о лайках постов по ID блога в БД.*/
  public async deleteAllPostLikeDataByBlogId(id: string): Promise<void> {
    /*Просим модель "PostLikeDataModel" удалить данные о лайках постов по ID блога в БД.*/
    await this.postLikeDataModel.deleteMany({ blogId: id });
  }
}
