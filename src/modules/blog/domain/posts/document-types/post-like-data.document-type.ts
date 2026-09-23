import { HydratedDocument } from 'mongoose';
import { PostLikeData } from '../post-like-data.entity';

/*Тип документа для данных о лайке поста.*/
export type PostLikeDataDocumentType = HydratedDocument<PostLikeData>;
