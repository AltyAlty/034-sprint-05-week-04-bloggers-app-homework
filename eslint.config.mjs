/*Включаем проверку типов TypeScript внутри обычного JS/MJS-файла.*/
// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

/*Экспортируем итоговую конфигурацию ESLint, собранную из нескольких частей.*/
export default tseslint.config(
  {
    /*Игнорируем файл "eslint.config.mjs", папку "node_modules" и папку "dist".*/
    ignores: ['eslint.config.mjs', 'node_modules', 'dist'],
  },

  /*Подключаем базовые рекомендованные правила ESLint.*/
  eslint.configs.recommended,

  /*Подключаем рекомендованные правила TypeScript с учетом проверки типов.*/
  ...tseslint.configs.recommendedTypeChecked,

  /*Подключаем интеграцию Prettier с ESLint.*/
  eslintPluginPrettierRecommended,
  {
    /*Задаем глобальный контекст для парсинга кода.*/
    languageOptions: {
      globals: {
        /*Добавляем глобальные переменные Node.js, чтобы ESLint не считал их undefined.*/
        ...globals.node,
        /*Добавляем глобальные переменные Jest для тестов.*/
        ...globals.jest,
      },

      /*Сообщаем ESLint, что код написан в стиле ES-модулей (import/export).*/
      sourceType: 'module',

      /*Указываем дополнительные инструкции парсеру для глубокого анализа TypeScript-кода.*/
      parserOptions: {
        /*Включаем автоматическую интеграцию с TypeScript, позволяя ESLint проверять типы данных на основе файлов
        tsconfig.*/
        projectService: true,
        /*Указываем парсеру, что искать файл "tsconfig.json" нужно начиная с папки, в которой находится текущий файл
        конфигурации.*/
        tsconfigRootDir: import.meta.dirname,
      },
    },

    /*Подключаем плагины.*/
    plugins: {
      /*Регистрируем плагин сортировки импортов simple-import-sort.*/
      'simple-import-sort': simpleImportSort,
    },
  },
  {
    rules: {
      /*Разрешаем использование типа any без ошибки линтера.*/
      '@typescript-eslint/no-explicit-any': 'off',
      /*Предупреждаем, если создан промис, но для него не используется await и он не обрабатывается.*/
      '@typescript-eslint/no-floating-promises': 'warn',
      /*Предупреждаем при потенциально небезопасной передаче значения без нормальной типизации.*/
      '@typescript-eslint/no-unsafe-argument': 'warn',
      /*Превращаем нарушения форматирования Prettier в ошибки ESLint. Опция "{ endOfLine: 'auto' }" помогает избежать
      конфликтов между Windows и Linux/macOS.*/
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      /*Предупреждаем о неиспользуемых переменных.*/
      '@typescript-eslint/no-unused-vars': 'warn',
      /*Требуем использовать только строгие сравнения в коде.*/
      eqeqeq: ['error', 'always'],
      /*Правило для simple-import-sort, которое устанавливает правило сортировки экспортов по алфавиту.*/
      'simple-import-sort/exports': 'error',
      /*Настройка правил сортировки импортов для simple-import-sort.*/
      'simple-import-sort/imports': [
        /*Устанавливаем уровень серьезности правила в ESLint: если импорты будут расположены не по этому правилу, то
        ESLint покажет красную ошибку.*/
        'error',
        {
          /*Создаем одну группу в одном массиве, чтобы избежать пустых строк между группами.*/
          groups: [
            [
              /*1. Side-effect imports, например, 'reflect-metadata' или 'dotenv/config'. "^\\u0000" - это Null-символ,
              который является официальным хаком/трюком. Плагин внутри себя помечает все импорты с побочными эффектами
              этим невидимым символом в начале, что позволяет такие импорты ставить на самый верх.*/
              '^\\u0000',
              /*2. Файлы БД, то есть файлы, которые имеют в пути или имени ".db".*/
              '^.+\\.db(/|$)',
              /*3. Файлы, имеющие отношение к IOC, то есть файлы из папки "src/ioc/". Не будет применяться для файлов
              внутри папки "src/ioc/".*/
              '(^|/)ioc(/|$)',
              /*4. Внешние пакеты, то есть те, которые не начинаются с "." или "/".*/
              '^@?\\w',
              /*5. Guard-middlewares, то есть файлы, которые имеют в имени ".guard-middleware".*/
              '\\.guard-middleware(/|$)',
              /*6. Middlewares, то есть файлы, которые имеют в имени ".middleware" или ".middlewares".*/
              '\\.middlewares?(/|$)',
              /*7. Адаптеры, то есть файлы, которые имеют в имени ".adapter".*/
              '\\.adapter(/|$)',
              /*8. Роутеры, то есть файлы, которые имеют в имени ".router".*/
              '\\.router(/|$)',
              /*9. Контроллеры, то есть файлы, которые имеют в имени ".controller".*/
              '\\.controller(/|$)',
              /*10. Сервисы, то есть файлы, которые имеют в имени ".service".*/
              '(?<!query-)\\.service(/|$)|(?<!\\.query-)service(/|$)',
              /*11. Query-сервисы, то есть файлы, которые имеют в имени ".query-service".*/
              '\\.query-service(/|$)',
              /*12. Репозитории, то есть файлы, которые имеют в имени ".repository".*/
              '(?<!query-)\\.repository(/|$)',
              /*13. Query-репозитории, то есть файлы, которые имеют в имени ".query-repository".*/
              '\\.query-repository(/|$)',
              /*14. Модели Mongoose, то есть файлы, которые имеют в имени ".model".*/
              '\\.model(/|$)',
              /*15. Типы, то есть файлы, которые имеют в имени ".type" или ".d".*/
              '\\.(type|d)(/|$)',
              /*16. Input-DTO, то есть файлы, которые имеют в имени ".input-dto".*/
              '\\.input-dto(/|$)',
              /*17. Output-DTO, то есть файлы, которые имеют в имени ".output-dto".*/
              '\\.output-dto(/|$)',
              /*18. Мапперы, то есть файлы, которые имеют в имени ".util" и начинаются с "map-from".*/
              '/map-from[^/]*\\.util(/|$)',
              /*19. Прочие утилиты, то есть файлы, которые имеют в имени ".util".*/
              '\\.util(/|$)',
              /*20. Тестовые данные, то есть файлы, которые имеют в имени ".test-data".*/
              '\\.test-data(/|$)',
              /*21. Тестовые утилиты, то есть файлы, которые имеют в имени ".test-util".*/
              '\\.test-util(/|$)',
              /*22. Все остальное.*/
              '^',
            ],
          ],
        },
      ],
    },
  }
);
