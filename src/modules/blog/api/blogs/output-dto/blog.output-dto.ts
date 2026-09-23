import { ApiProperty } from '@nestjs/swagger';
import {
  BlogListPostgresqlDb,
  BlogPostgresqlDb,
} from '../../../infrastructure/blogs/postgresql-types/blog-postgresql-db.type';
import { BlogListOutputDTO } from './blog-list.output-dto';
import { BlogDocumentType } from '../../../domain/blogs/document-types/blog.document-type';
import { BlogListDocumentType } from '../../../domain/blogs/document-types/blog-list.document-type';

/*Output DTO для блога.*/
export class BlogOutputDTO {
  @ApiProperty({ example: '60d5ec386f6e5a1b3c9d4e2a', description: 'Blog ID' })
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
  public static mapFromBlogDocumentTypeToBlogOutputDTO(blog: BlogDocumentType): BlogOutputDTO {
    const blogOutputDTO: BlogOutputDTO = new BlogOutputDTO();
    blogOutputDTO.id = blog._id.toString();
    blogOutputDTO.name = blog.name;
    blogOutputDTO.description = blog.description;
    blogOutputDTO.websiteUrl = blog.websiteUrl;
    blogOutputDTO.createdAt = blog.createdAt;
    blogOutputDTO.isMembership = blog.isMembership;
    return blogOutputDTO;
  }

  /*Маппер для преобразования блогов из БД в подготовленные для отправки клиенту блоги.*/
  public static mapFromBlogListDocumentTypeToBlogListOutputDTO(blogs: BlogListDocumentType): BlogListOutputDTO {
    return blogs.map((blog: BlogDocumentType) => {
      return this.mapFromBlogDocumentTypeToBlogOutputDTO(blog);
    });
  }

  /*Маппер для преобразования блога из БД в подготовленный для отправки клиенту блог.*/
  public static mapFromBlogPostgresqlDbToBlogOutputDTO(blog: BlogPostgresqlDb): BlogOutputDTO {
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
  public static mapFromBlogListPostgresqlDbToBlogListOutputDTO(blogs: BlogListPostgresqlDb): BlogListOutputDTO {
    return blogs.map((blog: BlogPostgresqlDb) => {
      return this.mapFromBlogPostgresqlDbToBlogOutputDTO(blog);
    });
  }
}
