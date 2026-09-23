import { HydratedDocument } from 'mongoose';
import { CommentLikeData } from '../comment-like-data.entity';

/*Тип документа для данных о лайке комментария.*/
export type CommentLikeDataDocumentType = HydratedDocument<CommentLikeData>;
