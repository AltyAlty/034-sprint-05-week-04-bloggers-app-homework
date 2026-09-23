import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export const AppControllerSwaggerDecorators = {
  get hello() {
    return applyDecorators(
      ApiOperation({ summary: 'Greet the World!' }),
      ApiOkResponse({ description: 'The world has been greeted!' })
    );
  },
};
