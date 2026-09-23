export class BlogPostgresqlDb {
  public id: string;
  public name: string;
  public description: string;
  public website_url: string;
  public is_membership: boolean;
  public created_at: Date;
  public deleted_at: null | Date;
}

export type BlogListPostgresqlDb = BlogPostgresqlDb[];
