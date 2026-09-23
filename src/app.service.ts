import { Injectable } from '@nestjs/common';

/*Необязательный сервис для модуля "AppModule".*/
@Injectable()
export class AppService {
  constructor() {}

  public hello(): string {
    return 'Hello World!';
  }
}
