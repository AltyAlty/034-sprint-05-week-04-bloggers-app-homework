import { ApiProperty } from '@nestjs/swagger';
import { PostOutputDTO } from '../../../../../modules/blog/api/posts/output-dto/post.output-dto';
import { PostListOutputDTO } from '../../../../../modules/blog/api/posts/output-dto/post-list.output-dto';
import { PaginationMetaDataOutputDTO } from '../../../../pagination/output-dto/pagination-meta-data.output-dto';

/*Output DTO для списка постов с пагинацией для документации Swagger, так как для Swagger нужен именно класс, а не
просто тип.*/
export class PaginatedPostListSwaggerOutputDTO extends PaginationMetaDataOutputDTO<PostListOutputDTO> {
  @ApiProperty({ type: [PostOutputDTO] })
  public items: PostOutputDTO[];
}
