import { Model } from 'mongoose';
import { PostDocumentType } from '../document-types/post.document-type';
import { Post } from '../post.entity';

/*Тип модели для поста со статическими методами класса для сущности поста.*/
export type PostModelType = Model<PostDocumentType> & typeof Post;
