import { Model } from 'mongoose';
import { CommentLikeData } from '../comment-like-data.entity';
import { CommentLikeDataDocumentType } from '../document-types/comment-like-data.document-type';

/*Тип модели для данных о лайке комментария со статическими методами класса для сущности данных о лайке комментария.*/
export type CommentLikeDataModelType = Model<CommentLikeDataDocumentType> & typeof CommentLikeData;
