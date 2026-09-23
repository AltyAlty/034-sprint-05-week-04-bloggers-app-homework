import { HydratedDocument } from 'mongoose';
import { Comment } from '../comment.entity';

/*Тип документа для комментария.*/
export type CommentDocumentType = HydratedDocument<Comment>;
