import { validateSync, ValidationError } from 'class-validator';

/*Утилиты для конфигураций по работе с переменными окружения.*/
export const configValidationUtils = {
  /*Метод для валидации конфигураций по работе с переменными окружения.*/
  validateConfig: (config: object): void => {
    /*Методы "validate()" и "validateSync()" из библиотеки class-validator проверяют объект по метаданным, указанным
    декораторами. Методы "validate()" работает асинхронно в отличие от метода "validateSync()".*/
    const errors: ValidationError[] = validateSync(config);

    /*Если есть ошибки валидации, то формируем из них сообщение.*/
    if (errors.length > 0) {
      const sortedMessages: string = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
      throw new Error('Validation failed: ' + sortedMessages);
    }
  },

  convertToBoolean(value: string): boolean | null {
    const trimmedValue: string = value?.trim().toLowerCase();

    switch (trimmedValue) {
      case 'true':
      case '1':
      case 'enabled':
      case 'on':
        return true;

      case 'false':
      case '0':
      case 'disabled':
      case 'off':
        return false;

      default:
        return null;
    }
  },

  /*Метод для преобразования строковых enum в массив строковых значений. "<T extends Record<string, string>>" говорит,
  что должны приниматься только объекты, где ключи и значения являются строками.*/
  getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
    return Object.values(enumObj);
  },
};
