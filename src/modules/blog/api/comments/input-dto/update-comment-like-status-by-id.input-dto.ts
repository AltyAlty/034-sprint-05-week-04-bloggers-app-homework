import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformation/trim.transformation-decorator';

/*Тип для поля статуса лайка комментария, которое приходит от клиента.*/
export enum CommentLikeStatusInputDTO {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

/*Input DTO для изменения статуса лайка комментария по ID комментария с валидацией при помощи библиотеки
class-validator.*/
export class UpdateCommentLikeStatusByIdInputDTO {
  @ApiProperty({ enum: CommentLikeStatusInputDTO, example: 'Like', description: 'New comment like status' })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsEnum(CommentLikeStatusInputDTO, { message: `Field "$property" must be a 'Like', 'Dislike' or 'None'` })
  @Trim()
  public likeStatus: CommentLikeStatusInputDTO;
}
