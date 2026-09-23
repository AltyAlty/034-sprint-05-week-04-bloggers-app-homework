import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformation/trim.transformation-decorator';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../../core/validation/constraints/user.validation-constraints';
import { IsEmailOrLogin } from '../decorators/validation/is-email-or-login.validation-decorator';

/*Валидационный Input DTO для аутентификации пользователя по логину или email и паролю.*/
export class AuthUserByLoginOrEmailInputDTO {
  @ApiProperty({ example: 'userLogin/user@example.com', description: 'User login or email' })
  @IsEmailOrLogin()
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public loginOrEmail: string;

  @ApiProperty({ example: 'veryHardPassword', description: 'User password' })
  @Length(USER_VALIDATION_CONSTRAINTS.PASSWORD.MIN_LENGTH, USER_VALIDATION_CONSTRAINTS.PASSWORD.MAX_LENGTH, {
    message: 'Field "$property" must be between $constraint1 and $constraint2 characters',
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public password: string;
}
