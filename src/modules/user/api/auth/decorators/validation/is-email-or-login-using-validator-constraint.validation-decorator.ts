import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { normalizeEmail } from '../../../../../../core/utils/email/normalize-email.util';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../../../core/validation/constraints/user.validation-constraints';

/*Регистрируем класс "IsEmailOrLoginValidatorConstraint" как кастомный валидационный декоратор свойства, используя
декоратор "@ValidatorConstraint()".*/
@ValidatorConstraint({ name: 'isEmailOrLogin', async: false })
/*Создаем класс-валидатор, который реализует интерфейс "ValidatorConstraintInterface" из библиотеки class-validator.
Этот интерфейс обязует реализовать метод "validate()", но также можно опционально реализовать метод "defaultMessage()",
который позволяет переопределить дефолтное сообщение об ошибке.*/
export class IsEmailOrLoginValidatorConstraint implements ValidatorConstraintInterface {
  /*Метод "validate()" - это метод, используемый для валидации свойства, значение которого будет передано в параметр
  "value". Этот метод возвращает true, если валидация пройдена успешно, иначе - false.*/
  public validate(value: any): boolean {
    /*Проверяем является ли значение свойства строкой.*/
    if (typeof value !== 'string') return false;
    /*Обрезаем пробелы по бокам в значении свойства.*/
    const trimmedValue: string = value.trim();
    /*Определяем, является ли значение свойства email.*/
    const isEmail: boolean = trimmedValue.includes('@') && trimmedValue.includes('.');

    /*Если значение свойства похоже на email, то валидируем его по правилам валидации email.*/
    if (isEmail) {
      /*Нормализуем email перед проверкой.*/
      const normalizedEmail: string = normalizeEmail(trimmedValue);
      /*Регулярное выражение для проверки формата email.*/
      const emailRegex: RegExp = USER_VALIDATION_CONSTRAINTS.EMAIL.MATCHES;
      /*Валидируем значение свойства на формат email.*/
      return emailRegex.test(normalizedEmail);
    }

    /*Если значение свойства не похоже на email, то валидируем его по правилам валидации логина. Сначала проверяем длину
    значения свойства.*/
    if (
      trimmedValue.length < USER_VALIDATION_CONSTRAINTS.LOGIN.MIN_LENGTH ||
      trimmedValue.length > USER_VALIDATION_CONSTRAINTS.LOGIN.MAX_LENGTH
    )
      return false;

    /*Регулярное выражение для проверки формата логина.*/
    const loginRegex: RegExp = USER_VALIDATION_CONSTRAINTS.LOGIN.MATCHES;
    /*Валидируем значение свойства на формат логина.*/
    return loginRegex.test(trimmedValue);
  }

  /*Настраиваем метод "defaultMessage()" так, чтобы возвращались разные сообщения об ошибках в зависимости является ли
  значение свойства логином или email.*/
  public defaultMessage(args: ValidationArguments): string {
    /*Получаем значение свойства.*/
    const value: unknown = args.value;
    /*Определяем, является ли значение свойства email.*/
    const isEmail: boolean = typeof value === 'string' && value.includes('@') && value.includes('.');
    /*Возвращаем разные сообщения об ошибках в зависимости от того чем является значение свойства.*/
    return isEmail
      ? 'Email is invalid'
      : `Login must be between ${USER_VALIDATION_CONSTRAINTS.LOGIN.MIN_LENGTH} and ${USER_VALIDATION_CONSTRAINTS.LOGIN.MAX_LENGTH} characters and can contain only letters, numbers, underscores and hyphens`;
  }
}

/*Функция "IsEmailOrLogin()" - это фабрика декораторов, которая принимает необязательные настройки валидации, например,
кастомное сообщение об ошибке в формате "{ message: 'text' }".*/
export function IsEmailOrLogin(validationOptions?: ValidationOptions): PropertyDecorator {
  /*Возвращаем функцию-декоратор свойства. TS автоматически применит ее к какому-то свойству, если увидит декоратор
  "@IsEmailOrLogin()" рядом со свойством. TS передаст в эту функцию-декоратор прототип класса, а вторым параметром -
  имя свойства в виде строки.*/
  return function (object: object, propertyName: string | symbol): void {
    /*Вызываем функцию "registerDecorator()", чтобы зарегистрировать кастомный валидационный декоратор свойства во
    внутреннем реестре библиотеки class-validator. В параметрах функции "registerDecorator()" конфигурируем объект с
    настройками этой функции.*/
    registerDecorator({
      /*Указываем уникальное имя декоратора для внутренней идентификации в библиотеке class-validator. Должно совпадать
      с именем как в декораторе "@ValidatorConstraint()".*/
      name: 'isEmailOrLogin',
      /*Функция "registerDecorator()" требует, чтобы при вызове декоратора свойства в параметре "target" был не прототип
      класса, как этого требует TS, а сам класс. Поэтому указываем здесь "object.constructor", так как объект "object" -
      это прототип класса, а свойство "object.constructor" - это сам класс.*/
      target: object.constructor,
      /*Указываем имя свойства, которое валидируется.*/
      propertyName: propertyName as string,
      /*Передаем настройки (кастомное сообщение об ошибке), если были указаны.*/
      options: validationOptions,
      /*Настраиваем объект-валидатор с методом "validate()", который библиотека class-validator будет вызывать для
      проверки значения свойства. Указываем не объект с методами, а сам класс-валидатор
      "IsEmailOrLoginValidatorConstraint". Библиотека class-validator сама будет создавать его экземпляр и вызывать его
      методы "validate()" и "defaultMessage()".*/
      validator: IsEmailOrLoginValidatorConstraint,
    });
  };
}
