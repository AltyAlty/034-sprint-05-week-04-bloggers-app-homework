/*Так как Jest по умолчанию ожидает файл конфигурации в формате CommonJS, то есть не поддерживает работу с
import/export, используем "module.exports", чтобы экспортировать объект настроек для Jest.*/
module.exports = {
  /*Используем готовый набор настроек для тестирования на TypeScript через ts-jest.*/
  preset: 'ts-jest',
  /*Указываем среду выполнения тестов как Node.js.*/
  testEnvironment: 'node',
  /*Устанавливаем корень проекта как базовый путь для всех остальных настроек.*/
  rootDir: '.',
  /*Указываем список расширений файлов, которые Jest будет искать и обрабатывать.*/
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  /*Указываем пути для поиска тестовых файлов.*/
  testMatch: ['**/src/**/*.spec.ts', '**/__tests__/{integration,unit-tests}/**/*.(test|spec).ts'],
  /*Исключаем указанные папки и файлы из процесса поиска тестов.*/
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/(utils|test-data|test-doubles|setup)/'],
  /*Указываем путь к файлу с настройками тестовой среды.*/
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/jest.setup.ts'],
  /*Устанавливаем правило для компиляции TS и JS файлов через компилятор ts-jest перед запуском.*/
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  /*Указываем, для каких исходных файлов собирать отчет о покрытии тестами.*/
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  /*Указываем папку, в которую будет сохраняться итоговый отчет о покрытии тестами.*/
  coverageDirectory: './coverage',
};
