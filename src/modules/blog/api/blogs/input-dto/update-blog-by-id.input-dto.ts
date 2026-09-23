import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, Length, Matches } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformation/trim.transformation-decorator';
import { BLOG_VALIDATION_CONSTRAINTS } from '../../../../../core/validation/constraints/blog.validation-constraints';

/*Валидационный Input DTO для изменения блога по ID.*/
export class UpdateBlogByIdInputDTO {
  @ApiProperty({ example: 'updatedBlogName', description: 'New blog name' })
  @Length(BLOG_VALIDATION_CONSTRAINTS.NAME.MIN_LENGTH, BLOG_VALIDATION_CONSTRAINTS.NAME.MAX_LENGTH, {
    message: 'Field "$property" must be between $constraint1 and $constraint2 characters',
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public name: string;

  @ApiProperty({ example: 'updatedBlogDescription', description: 'New blog description' })
  @Length(BLOG_VALIDATION_CONSTRAINTS.DESCRIPTION.MIN_LENGTH, BLOG_VALIDATION_CONSTRAINTS.DESCRIPTION.MAX_LENGTH, {
    message: 'Field "$property" must be between $constraint1 and $constraint2 characters',
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public description: string;

  @ApiProperty({ example: 'https://updated-blog-example.xyz/', description: 'New blog website' })
  @IsUrl({}, { message: 'Field "$property" is invalid' })
  @Matches(BLOG_VALIDATION_CONSTRAINTS.WEBSITE_URL.MATCHES, {
    message: 'Field "$property" is invalid',
  })
  @Length(BLOG_VALIDATION_CONSTRAINTS.WEBSITE_URL.MIN_LENGTH, BLOG_VALIDATION_CONSTRAINTS.WEBSITE_URL.MAX_LENGTH, {
    message: 'Field "$property" must be between $constraint1 and $constraint2 characters',
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public websiteUrl: string;
}
