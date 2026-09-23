import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformation/trim.transformation-decorator';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../../core/validation/constraints/user.validation-constraints';

/*Валидационный Input DTO для повторной отправки письма для подтверждения регистрации пользователя.*/
export class ResendConfirmationEmailInputDTO {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail({}, { message: 'Field "$property" is invalid' })
  @Matches(USER_VALIDATION_CONSTRAINTS.EMAIL.MATCHES, { message: 'Field "$property" is invalid' })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public email: string;
}
