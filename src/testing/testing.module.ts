import { Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';
import { TestingService } from './application/testing.service';

/*Модуль для тестирования приложения.*/
@Module({
  imports: [],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
