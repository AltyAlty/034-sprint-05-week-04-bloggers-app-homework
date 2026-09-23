import { Model } from 'mongoose';
import { Blog } from '../blog.entity';
import { BlogDocumentType } from '../document-types/blog.document-type';

/*Тип модели для блога со статическими методами класса для сущности блога.*/
export type BlogModelType = Model<BlogDocumentType> & typeof Blog;
