import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DefaultPaginationSettingsInputDTO } from '../../../../../../core/pagination/input-dto/default-pagination-settings.input-dto';
import { CommentSortFieldQueryInputDTO } from '../../../comments/input-dto/query/comment-sort-field-query.input-dto';

/*Input DTO для query-параметров при поиске комментариев по ID поста.*/
export class GetCommentListByPostIdQueryInputDTO extends DefaultPaginationSettingsInputDTO {
  @ApiPropertyOptional({
    enum: CommentSortFieldQueryInputDTO,
    default: CommentSortFieldQueryInputDTO.CreatedAt,
    description: 'Term to sort by',
  })
  @IsEnum(CommentSortFieldQueryInputDTO)
  @IsOptional()
  public sortBy: CommentSortFieldQueryInputDTO = CommentSortFieldQueryInputDTO.CreatedAt;
}
