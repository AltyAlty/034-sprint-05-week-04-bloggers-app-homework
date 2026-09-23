import { ApiProperty } from '@nestjs/swagger';
import { BlogOutputDTO } from '../../../../../modules/blog/api/blogs/output-dto/blog.output-dto';
import { BlogListOutputDTO } from '../../../../../modules/blog/api/blogs/output-dto/blog-list.output-dto';
import { PaginationMetaDataOutputDTO } from '../../../../pagination/output-dto/pagination-meta-data.output-dto';

/*Output DTO для списка блогов с пагинацией для документации Swagger, так как для Swagger нужен именно класс, а не
просто тип.*/
export class PaginatedBlogListSwaggerOutputDTO extends PaginationMetaDataOutputDTO<BlogListOutputDTO> {
  @ApiProperty({ type: [BlogOutputDTO] })
  public items: BlogOutputDTO[];
}
