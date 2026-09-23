import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformation/trim.transformation-decorator';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../../core/validation/constraints/user.validation-constraints';

/*Валидационный Input DTO для установления нового пароля пользователя по коду восстановления пароля пользователя.*/
export class SetNewPasswordByPasswordRecoveryCodeInputDTO {
  @ApiProperty({ example: 'veryHardPassword', description: 'User password' })
  @Length(USER_VALIDATION_CONSTRAINTS.PASSWORD.MIN_LENGTH, USER_VALIDATION_CONSTRAINTS.PASSWORD.MAX_LENGTH, {
    message: 'Field "$property" must be between $constraint1 and $constraint2 characters',
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public password: string;

  @ApiProperty({ example: '60d5ec386f6e5a1b3c9d4e2a', description: 'Password recovery code' })
  @Matches(USER_VALIDATION_CONSTRAINTS.PASSWORD_RECOVERY_CODE.MATCHES, { message: 'Field "$property" is invalid' })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public recoveryCode: string;
}
