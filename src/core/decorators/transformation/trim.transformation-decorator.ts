import { Transform, TransformFnParams } from 'class-transformer';

/*Декоратор, имитирующий работу метода "trim()" для строк, так как в библиотеке class-transformer нет своего встроенного
декоратора "@Trim()".*/
export const Trim = (): PropertyDecorator =>
  Transform(({ value }: TransformFnParams): any => (typeof value === 'string' ? value.trim() : value));
