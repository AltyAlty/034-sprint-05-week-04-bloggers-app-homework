import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformation/trim.transformation-decorator';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../../core/validation/constraints/user.validation-constraints';

/*Валидационный Input DTO для подтверждения регистрации пользователя по коду.*/
export class ConfirmUserByCodeInputDTO {
  @ApiProperty({ example: '60d5ec386f6e5a1b3c9d4e2a', description: 'Confirmation code' })
  @Matches(USER_VALIDATION_CONSTRAINTS.CONFIRMATION_REGISTRATION_CODE.MATCHES, {
    message: 'Field "$property" is invalid',
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public code: string;
}
