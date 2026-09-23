import { HydratedDocument } from 'mongoose';
import { Post } from '../post.entity';

/*Тип документа для поста.*/
export type PostDocumentType = HydratedDocument<Post>;
