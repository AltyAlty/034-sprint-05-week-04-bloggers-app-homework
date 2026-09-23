import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../domain/blogs/blog.entity';
import { BlogDocumentType } from '../../domain/blogs/document-types/blog.document-type';
import type { BlogModelType } from '../../domain/blogs/model-types/blog.model-type';

/*Репозиторий для блогов.*/
@Injectable()
export class BlogsRepository {
  public constructor(@InjectModel(Blog.name) private readonly blogModel: BlogModelType) {}

  /*Метод для сохранения блога в БД.*/
  public async save(blog: BlogDocumentType): Promise<void> {
    await blog.save();
  }

  /*Метод для поиска блога по ID в БД.*/
  public async findById(id: string): Promise<BlogDocumentType | null> {
    /*Просим модель "BlogModel" найти блог по ID в БД.*/
    return await this.blogModel.findOne({ _id: id, deletedAt: null });
  }

  /*Метод для hard удаления блога по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим модель "BlogModel" удалить блог по ID в БД.*/
    await this.blogModel.deleteOne({ _id: id });
  }
}
