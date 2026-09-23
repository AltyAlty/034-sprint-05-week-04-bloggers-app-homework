import { ApiProperty } from '@nestjs/swagger';
import { CommentOutputDTO } from '../../../../../modules/blog/api/comments/output-dto/comment.output-dto';
import { CommentListOutputDTO } from '../../../../../modules/blog/api/comments/output-dto/comment-list.output-dto';
import { PaginationMetaDataOutputDTO } from '../../../../pagination/output-dto/pagination-meta-data.output-dto';

/*Output DTO для списка комментариев с пагинацией для документации Swagger, так как для Swagger нужен именно класс, а не
просто тип.*/
export class PaginatedCommentListSwaggerOutputDTO extends PaginationMetaDataOutputDTO<CommentListOutputDTO> {
  @ApiProperty({ type: [CommentOutputDTO] })
  public items: CommentOutputDTO[];
}
