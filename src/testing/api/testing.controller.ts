import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestingService } from '../application/testing.service';
import { SETTINGS } from '../../core/settings/settings';
import { TestingControllerSwaggerDecorators } from '../../core/swagger/decorators/testing-module/testing-controller.swagger-decorators';

/*Контроллер для тестирования приложения.*/
@ApiTags(SETTINGS.TESTING_API_TAG)
@Controller(SETTINGS.TESTING_PREFIX)
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  /*001. DELETE-запрос по очистке БД.*/
  @TestingControllerSwaggerDecorators.clearDb
  @Delete(SETTINGS.TESTING_CLEAR_DB_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async clearDb(): Promise<void> {
    await this.testingService.clearDb();
    await this.testingService.clearPostgresDb();
  }
}
