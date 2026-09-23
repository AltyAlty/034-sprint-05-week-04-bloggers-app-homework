import { Model } from 'mongoose';
import { PostLikeDataDocumentType } from '../document-types/post-like-data.document-type';
import { PostLikeData } from '../post-like-data.entity';

/*Тип модели для данных о лайке поста со статическими методами класса для сущности данных о лайке поста.*/
export type PostLikeDataModelType = Model<PostLikeDataDocumentType> & typeof PostLikeData;
