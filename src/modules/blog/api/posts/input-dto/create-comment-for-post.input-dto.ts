import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformation/trim.transformation-decorator';
import { COMMENT_VALIDATION_CONSTRAINTS } from '../../../../../core/validation/constraints/comment.validation-constraints';

/*Валидационный Input DTO для создания комментария в посте.*/
export class CreateCommentForPostInputDTO {
  @ApiProperty({ example: 'veryLongCommentContent', description: 'Comment content' })
  @Length(COMMENT_VALIDATION_CONSTRAINTS.CONTENT.MIN_LENGTH, COMMENT_VALIDATION_CONSTRAINTS.CONTENT.MAX_LENGTH, {
    message: 'Field "$property" must be between $constraint1 and $constraint2 characters',
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public content: string;
}
