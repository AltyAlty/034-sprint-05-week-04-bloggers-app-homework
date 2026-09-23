import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';
import { GetBlogListQueryInputDTO } from '../../api/blogs/input-dto/query/get-blog-list-query.input-dto';
import { Blog } from '../../domain/blogs/blog.entity';
import { BlogDocumentType } from '../../domain/blogs/document-types/blog.document-type';
import { BlogListDocumentType } from '../../domain/blogs/document-types/blog-list.document-type';
import type { BlogModelType } from '../../domain/blogs/model-types/blog.model-type';

/*Query-репозиторий для блогов.*/
@Injectable()
export class BlogsQueryRepository {
  public constructor(@InjectModel(Blog.name) private readonly blogModel: BlogModelType) {}

  /*Метод для поиска блога по ID в БД.*/
  public async findById(id: string): Promise<BlogDocumentType | null> {
    /*Просим модель "BlogModel" найти блог по ID в БД.*/
    return await this.blogModel.findOne({ _id: id, deletedAt: null });
  }

  /*Метод для поиска блогов в БД.*/
  public async findAll(dto: GetBlogListQueryInputDTO): Promise<{ items: BlogListDocumentType; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();
    /*Динамически собираем фильтр для поиска в MongoDB. Начинаем с пустого фильтра если используем hard удаление, либо
    с "deletedAt: null", если используем soft удаление.*/
    const filter: QueryFilter<BlogDocumentType> = { deletedAt: null };
    /*Если в query-параметрах было указано имя блога, то добавляем условие по полю "name".
    "$regex: query.searchNameTerm" означает поиск по шаблону - по вхождению строки. "$options: 'i'" означает, что поиск
    будет без учета регистра.*/
    if (dto.searchNameTerm) filter.name = { $regex: dto.searchNameTerm, $options: 'i' };

    /*Просим модель "BlogModel" найти блоги в БД:
    1. ".find(filter)": выбираем документы по собранному фильтру.
    2. ".sort({ [dto.sortBy]: dto.sortDirection })": сортируем по полю сортировки, которое берется динамически из
    свойства "dto.sortBy", а направление сортировки из свойства "dto.sortDirection".
    3. ".skip(skip)": пропускаем нужное количество записей, чтобы взять записи для запрошенной страницы.
    4. ".limit(dto.pageSize)": берем записей не больше размера запрошенной страницы.*/
    const [items, totalCount]: [BlogListDocumentType, number] = await Promise.all([
      this.blogModel
        .find(filter)
        .sort({ [dto.sortBy]: dto.sortDirection })
        .skip(skip)
        .limit(dto.pageSize),
      /*Просим модель "BlogModel" подсчитать общее количество документов, подходящих под фильтр, без учета пагинации.*/
      this.blogModel.countDocuments(filter),
    ]);

    /*Возвращаем данные по блогам.*/
    return { items, totalCount };
  }
}
