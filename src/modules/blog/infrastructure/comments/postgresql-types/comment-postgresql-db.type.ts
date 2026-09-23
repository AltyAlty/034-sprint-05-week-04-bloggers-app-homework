export class CommentPostgresqlDb {
  public id: string;
  public post_id: string;
  public blog_id: string;
  public user_id: string;
  public user_login: string;
  public content: string;
  public likes_count: number;
  public dislikes_count: number;
  public created_at: Date;
  public deleted_at: null | Date;
}

export type CommentListPostgresqlDb = CommentPostgresqlDb[];
