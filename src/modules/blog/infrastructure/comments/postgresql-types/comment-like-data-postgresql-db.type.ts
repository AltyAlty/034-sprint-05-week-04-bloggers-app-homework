import { CommentLikeStatusDomainDTO } from '../../../domain/comments/domain-dto/comment-like-status.domain-dto';

export class CommentLikeDataPostgresqlDb {
  public id: string;
  public comment_id: string;
  public post_id: string;
  public blog_id: string;
  public user_id: string;
  public like_status: CommentLikeStatusDomainDTO;
  public added_at: Date;
}

export type CommentLikeDataListPostgresqlDb = CommentLikeDataPostgresqlDb[];
