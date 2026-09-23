import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformation/trim.transformation-decorator';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../../core/validation/constraints/user.validation-constraints';

/*Валидационный Input DTO для создания пользователя.*/
export class CreateUserInputDTO {
  @ApiProperty({ example: 'userLogin', description: 'User login' })
  @Matches(USER_VALIDATION_CONSTRAINTS.LOGIN.MATCHES, {
    message: 'Field "$property" can only contain letters, numbers, underscores and hyphens',
  })
  @Length(USER_VALIDATION_CONSTRAINTS.LOGIN.MIN_LENGTH, USER_VALIDATION_CONSTRAINTS.LOGIN.MAX_LENGTH, {
    message: `Field "$property" must be between $constraint1 and $constraint2 characters`,
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public login: string;

  @ApiProperty({ example: 'veryHardPassword', description: 'User password' })
  @Length(USER_VALIDATION_CONSTRAINTS.PASSWORD.MIN_LENGTH, USER_VALIDATION_CONSTRAINTS.PASSWORD.MAX_LENGTH, {
    message: `Field "$property" must be between $constraint1 and $constraint2 characters`,
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public password: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail({}, { message: 'Field "$property" is invalid' })
  @Matches(USER_VALIDATION_CONSTRAINTS.EMAIL.MATCHES, { message: 'Field "$property" is invalid' })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public email: string;
}
