export class PostPostgresqlDb {
  public id: string;
  public blog_id: string;
  public blog_name: string;
  public title: string;
  public short_description: string;
  public content: string;
  public likes_count: number;
  public dislikes_count: number;
  public created_at: Date;
  public deleted_at: null | Date;
}

export type PostListPostgresqlDb = PostPostgresqlDb[];
