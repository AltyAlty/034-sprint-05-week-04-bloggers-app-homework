import { ApiProperty } from '@nestjs/swagger';
import { BlogDb, BlogListDb } from '../../../infrastructure/blogs/types/blog-db.type';

/*Output DTO для блога.*/
export class BlogOutputDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Blog ID' })
  public id: string;

  @ApiProperty({ example: 'blogName', description: 'Blog name' })
  public name: string;

  @ApiProperty({ example: 'blogDescription', description: 'Blog description' })
  public description: string;

  @ApiProperty({ example: 'https://blog-example.xyz/', description: 'Blog website' })
  public websiteUrl: string;

  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'Blog creation date' })
  public createdAt: Date;

  @ApiProperty({ example: 'true', description: 'Blog membership status' })
  public isMembership: boolean;

  /*Маппер для преобразования блога из БД в подготовленный для отправки клиенту блог.*/
  public static mapFromBlogDbToBlogOutputDTO(blog: BlogDb): BlogOutputDTO {
    const blogOutputDTO: BlogOutputDTO = new BlogOutputDTO();
    blogOutputDTO.id = blog.id;
    blogOutputDTO.name = blog.name;
    blogOutputDTO.description = blog.description;
    blogOutputDTO.websiteUrl = blog.website_url;
    blogOutputDTO.createdAt = blog.created_at;
    blogOutputDTO.isMembership = blog.is_membership;
    return blogOutputDTO;
  }

  /*Маппер для преобразования блогов из БД в подготовленные для отправки клиенту блоги.*/
  public static mapFromBlogListDbToBlogListOutputDTO(blogs: BlogListDb): BlogListOutputDTO {
    return blogs.map((blog: BlogDb) => this.mapFromBlogDbToBlogOutputDTO(blog));
  }
}

/*Output DTO для списка блогов.*/
export type BlogListOutputDTO = BlogOutputDTO[];
