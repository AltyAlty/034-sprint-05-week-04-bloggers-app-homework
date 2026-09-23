import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformation/trim.transformation-decorator';
import { POST_VALIDATION_CONSTRAINTS } from '../../../../../core/validation/constraints/post.validation-constraints';

/*Валидационный Input DTO для создания поста.*/
export class CreatePostInputDTO {
  @ApiProperty({ example: 'postTitle', description: 'Post title' })
  @Length(POST_VALIDATION_CONSTRAINTS.TITLE.MIN_LENGTH, POST_VALIDATION_CONSTRAINTS.TITLE.MAX_LENGTH, {
    message: 'Field "$property" must be between $constraint1 and $constraint2 characters',
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public title: string;

  @ApiProperty({ example: 'shortPostDescription', description: 'Short post description' })
  @Length(
    POST_VALIDATION_CONSTRAINTS.SHORT_DESCRIPTION.MIN_LENGTH,
    POST_VALIDATION_CONSTRAINTS.SHORT_DESCRIPTION.MAX_LENGTH,
    {
      message: 'Field "$property" must be between $constraint1 and $constraint2 characters',
    }
  )
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public shortDescription: string;

  @ApiProperty({ example: 'postContent', description: 'Post content' })
  @Length(POST_VALIDATION_CONSTRAINTS.CONTENT.MIN_LENGTH, POST_VALIDATION_CONSTRAINTS.CONTENT.MAX_LENGTH, {
    message: 'Field "$property" must be between $constraint1 and $constraint2 characters',
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public content: string;

  @ApiProperty({ example: '60d5ec386f6e5a1b3c9d4e2a', description: 'ID of the blog that contains the post' })
  /*Для MongoDB.*/
  // @IsMongoId({ message: 'Field "$property" must be an ObjectId' })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public blogId: string;
}
