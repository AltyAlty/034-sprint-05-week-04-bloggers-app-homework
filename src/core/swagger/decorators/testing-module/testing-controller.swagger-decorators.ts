import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';

export const TestingControllerSwaggerDecorators = {
  get clearDb() {
    return applyDecorators(
      ApiOperation({ summary: 'Clear the database' }),
      ApiNoContentResponse({ description: 'Clears the database' })
    );
  },
};
