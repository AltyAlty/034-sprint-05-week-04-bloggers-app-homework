import { Model } from 'mongoose';
import { Comment } from '../comment.entity';
import { CommentDocumentType } from '../document-types/comment.document-type';

/*Тип модели для комментария со статическими методами класса для сущности комментария.*/
export type CommentModelType = Model<CommentDocumentType> & typeof Comment;
