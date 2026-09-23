import { PostLikeStatusDomainDTO } from '../../../domain/posts/domain-dto/post-like-status.domain-dto';

export class PostLikeDataPostgresqlDb {
  public id: string;
  public post_id: string;
  public blog_id: string;
  public user_id: string;
  public login: string;
  public like_status: PostLikeStatusDomainDTO;
  public added_at: Date;
}

export type PostLikeDataListPostgresqlDb = PostLikeDataPostgresqlDb[];
