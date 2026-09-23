import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AppControllerSwaggerDecorators } from './core/swagger/decorators/app-module/app-controller.swagger-decorators';

/*Необязательный контроллер для модуля "AppModule".*/
@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @AppControllerSwaggerDecorators.hello
  @Get()
  @HttpCode(HttpStatus.OK)
  public hello(): string {
    return this.appService.hello();
  }
}
