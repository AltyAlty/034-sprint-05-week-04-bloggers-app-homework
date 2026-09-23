import { HydratedDocument } from 'mongoose';
import { Blog } from '../blog.entity';

/*Тип документа для блога.*/
export type BlogDocumentType = HydratedDocument<Blog>;
