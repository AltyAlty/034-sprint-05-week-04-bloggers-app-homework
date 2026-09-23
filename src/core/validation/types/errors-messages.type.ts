import { ApiProperty } from '@nestjs/swagger';

export class ErrorMessageType {
  public field: string;
  public message: string;
}

/*Тип для формата ошибок, возвращаемых клиенту при валидации входных данных.*/
export type ErrorsMessagesType = ErrorMessageType[];

/*Аналог типа "ErrorMessageType" в виде класса для документации Swagger.*/
class ErrorMessageSwaggerType {
  @ApiProperty({ example: 'id', description: 'Field that caused error' })
  public field: string;

  @ApiProperty({ example: 'Blog not found', description: 'Error message' })
  public message: string;
}

/*Тип для формата ошибок для Swagger, возвращаемых клиенту при валидации входных данных.*/
export class ErrorsMessagesSwaggerType {
  @ApiProperty({ type: [ErrorMessageSwaggerType] })
  public errorsMessages: ErrorMessageSwaggerType[];
}
