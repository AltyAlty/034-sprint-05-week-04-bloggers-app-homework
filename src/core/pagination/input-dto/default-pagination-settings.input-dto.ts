import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SortDirectionInputDTO } from './sort-direction.input-dto';
import { SETTINGS } from '../../settings/settings';

/*Input DTO для объекта с настройками пагинации по умолчанию.*/
export class DefaultPaginationSettingsInputDTO {
  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @Min(1)
  @IsInt()
  @Type((): NumberConstructor => Number)
  @IsOptional()
  public pageNumber: number = SETTINGS.DEFAULT_PAGINATION_PAGE_NUMBER;

  @ApiPropertyOptional({ default: 10, description: 'Page size' })
  @Min(1)
  @IsInt()
  @Type((): NumberConstructor => Number)
  @IsOptional()
  public pageSize: number = SETTINGS.DEFAULT_PAGINATION_PAGE_SIZE;

  @ApiPropertyOptional({
    enum: SortDirectionInputDTO,
    default: SortDirectionInputDTO.Desc,
    description: 'Sorting direction',
  })
  @IsEnum(SortDirectionInputDTO)
  @IsOptional()
  public sortDirection: SortDirectionInputDTO = SETTINGS.DEFAULT_PAGINATION_SORT_DIRECTION;

  /*Метод для подсчета сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
  "pageNumber".*/
  public calculateSkip(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
