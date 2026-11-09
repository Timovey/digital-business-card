import type { ProfileSeed } from '../seed.types';

export const profileSeed: ProfileSeed = {
  fullName: 'Кочетков Тимофей Сергеевич',
  headline: 'Lead Fullstack-разработчик (Node.js / Vue.js)',
  description:
    'Lead Fullstack-разработчик с опытом коммерческой разработки более 4 лет. ' +
    'Веду модули в полном цикле: от архитектуры и общения с заказчиком до деплоя. ' +
    'Делаю code review, распределяю задачи и менторю разработчиков. ' +
    'Глубоко понимаю как backend (микросервисы, высоконагруженные БД), так и frontend (адаптив, WebSockets, SSE). ' +
    'Магистр в области ИИ и предиктивной аналитики; активно использую AI-инструменты (Claude Code, Cursor) ' +
    'для ускорения разработки, рефакторинга и генерации тестов.',
  location: 'Москва',
  avatar: {
    file: 'avatar.jpg',
    contentType: 'image/jpeg',
  },

  links: [
    { kind: 'GITHUB', label: 'Timovey', url: 'https://github.com/Timovey' },
    { kind: 'TELEGRAM', label: '@timovey73', url: 'https://t.me/timovey73' },
    {
      kind: 'EMAIL',
      label: 'kochetkovtimofey73@gmail.com',
      url: 'mailto:kochetkovtimofey73@gmail.com',
    },
    { kind: 'PHONE', label: '+7 927 825-46-70', url: 'tel:+79278254670' },
  ],

  skills: [
    { name: 'TypeScript', category: 'LANGUAGE' },
    { name: 'JavaScript', category: 'LANGUAGE' },
    { name: 'C#', category: 'LANGUAGE' },

    { name: 'Node.js', category: 'BACKEND' },
    { name: 'NestJS', category: 'BACKEND' },
    { name: 'Express', category: 'BACKEND' },
    { name: 'Moleculer', category: 'BACKEND' },
    { name: '.NET', category: 'BACKEND' },
    { name: 'Entity Framework Core', category: 'BACKEND' },
    { name: 'Refit', category: 'BACKEND' },
    { name: 'GraphQL', category: 'BACKEND' },
    { name: 'WebSocket', category: 'BACKEND' },
    { name: 'Socket.IO', category: 'BACKEND' },
    { name: 'SignalR', category: 'BACKEND' },
    { name: 'Prisma', category: 'BACKEND' },
    { name: 'TypeORM', category: 'BACKEND' },
    { name: 'Mongoose', category: 'BACKEND' },
    { name: 'RabbitMQ', category: 'BACKEND' },
    { name: 'Hangfire', category: 'BACKEND' },
    { name: 'Keycloak', category: 'BACKEND' },
    { name: 'Puppeteer', category: 'BACKEND' },
    { name: 'Telegram Bot API', category: 'BACKEND' },
    { name: 'OPC UA', category: 'BACKEND' },

    { name: 'Vue.js', category: 'FRONTEND' },
    { name: 'Nuxt', category: 'FRONTEND' },
    { name: 'Pinia', category: 'FRONTEND' },
    { name: 'Vuetify', category: 'FRONTEND' },
    { name: 'Vite', category: 'FRONTEND' },
    { name: 'Sass', category: 'FRONTEND' },

    { name: 'PostgreSQL', category: 'DATABASE' },
    { name: 'MySQL', category: 'DATABASE' },
    { name: 'MS SQL', category: 'DATABASE' },
    { name: 'MongoDB', category: 'DATABASE' },
    { name: 'Redis', category: 'DATABASE' },
    { name: 'Dgraph', category: 'DATABASE' },

    { name: 'Docker', category: 'DEVOPS' },
    { name: 'Docker Compose', category: 'DEVOPS' },
    { name: 'Nginx', category: 'DEVOPS' },
    { name: 'Linux', category: 'DEVOPS' },
    { name: 'CI/CD', category: 'DEVOPS' },
    { name: 'Git', category: 'DEVOPS' },
    { name: 'S3', category: 'DEVOPS' },

    { name: 'Jest', category: 'TESTING' },
    { name: 'Vitest', category: 'TESTING' },
    { name: 'Postman', category: 'TESTING' },
    { name: 'Bruno', category: 'TESTING' },
    { name: 'Selenium', category: 'TESTING' },

    { name: 'System Design', category: 'PRACTICE' },
    { name: 'Code Review', category: 'PRACTICE' },
    { name: 'Mentoring', category: 'PRACTICE' },
    { name: 'Agile', category: 'PRACTICE' },
    { name: 'OpenAPI', category: 'PRACTICE' },
  ],

  experience: [
    {
      company: 'WONE IT',
      location: 'Санкт-Петербург',
      position: 'Fullstack-разработчик / Feature Lead',
      startDate: '2025-03-01',
      technologies: [
        'TypeScript',
        'Node.js',
        'Moleculer',
        'Dgraph',
        'Redis',
        'OpenAPI',
        'Docker',
        'Jest',
        'Bruno',
        'Vue.js',
      ],
    },
    {
      company: 'Шевиант',
      companyUrl: 'https://sheviant.team/',
      location: 'Ульяновск',
      position: 'Ведущий Web-разработчик / Team Lead',
      startDate: '2023-03-01',
      endDate: '2025-02-01',
      technologies: [
        'Node.js',
        'NestJS',
        'Express',
        'Vue.js',
        'Nuxt',
        'PostgreSQL',
        'MySQL',
        'MongoDB',
        'Redis',
        'Docker',
        'Jest',
        'Postman',
      ],
    },
    {
      company: 'Экоинформ',
      location: 'Ульяновск',
      position: 'Fullstack-программист',
      startDate: '2022-02-01',
      endDate: '2023-03-01',
      technologies: ['Nuxt', '.NET', 'C#', 'MS SQL', 'Docker', 'Postman', 'Selenium'],
    },
  ],

  projects: [
    {
      name: 'Dophamint',
      kind: 'SIDE',
      description:
        'Платформа квестов: конструктор с развилками, модерация, прохождение соло и командами в реальном времени. ' +
        'Третья версия продукта: v1 — Node.js/Express + Nuxt, v2 — микросервисы на ASP.NET с real-time-прохождением ' +
        'и мобильным клиентом. Роль — архитектор и backend-разработчик. Код закрыт.',
      featured: true,
      achievements: [
        'Спроектировал v3 как модульный монолит на .NET 10: жёсткие границы модулей, своя схема БД у каждого, ' +
          'события между модулями через outbox, границы закреплены архитектурными тестами.',
        'Реализовал авторизацию через Keycloak, real-time-прохождение на SignalR и загрузку медиа в S3 по presigned URL.',
        'Сделал контракт OpenAPI источником правды: из него генерируются TS- и Dart-клиенты.',
        'На фронтенде сделал демо прохождения квеста.',
      ],
      technologies: [
        'C#',
        '.NET',
        'Entity Framework Core',
        'PostgreSQL',
        'SignalR',
        'Keycloak',
        'S3',
        'Docker',
        'OpenAPI',
        'Bruno',
        'System Design',
        'Nuxt',
      ],
    },
    {
      name: 'Шелковица',
      kind: 'SIDE',
      description:
        'Интернет-магазин нижнего белья для заказчика: витрина с каталогом и корзиной, оформление заказов, админка. ' +
        'Бэкенд на NestJS + TypeORM + PostgreSQL, фото в S3, витрина на Nuxt 3 (SSR/ISR). Код закрыт; сайт временно ' +
        'снят на время глубокой переработки.',
      demoUrl: 'https://test.shelkovitsa.ru',
      featured: true,
      achievements: [
        'Сделал импорт каталога из Excel-выгрузки поставщика с сопоставлением цветов и размеров поставщика и сайта.',
        'Настроил уведомления о заказах в Telegram и подготовил интеграцию с Яндекс Доставкой и Маркетом.',
        'Настроил CI на каждый PR: lint, unit-тесты, e2e на локальном диске и на S3, Postman-тесты.',
        'Автоматизировал деплой на собственный сервер: nginx + Let’s Encrypt, systemd, бэкапы pg_dump.',
      ],
      technologies: [
        'TypeScript',
        'NestJS',
        'TypeORM',
        'PostgreSQL',
        'S3',
        'Telegram Bot API',
        'Vitest',
        'Postman',
        'CI/CD',
        'Nginx',
        'Linux',
        'Nuxt',
      ],
    },
    {
      name: 'Система автоматизации ЖКХ',
      kind: 'WORK',
      experience: 'WONE IT',
      description:
        'Микросервисная система автоматизации ЖКХ: 200+ внутренних и более 200 000 внешних пользователей.',
      achievements: [
        'Feature Lead: веду несколько модулей в полном цикле — от сбора требований с заказчиком до деплоя.',
        'На основе API-спецификации сделал генерацию валидаторов для сервисов на Moleculer.',
        'Спроектировал переиспользуемую утилиту генерации и парсинга Excel-шаблонов (тысячи строк, несколько листов) ' +
          'с отслеживанием прогресса, логированием и обработкой ошибок. Модуль внедрён во все проекты компании ' +
          'и сократил время разработки аналогичного функционала на 60%.',
        'Внедрил Bruno для API-тестирования, что ускорило разработку и прогон тестов на 15%.',
        'Провожу code review, менторю 3 junior/middle-разработчиков, распределяю задачи и оцениваю сроки (Sprint Planning).',
      ],
      technologies: [
        'TypeScript',
        'Node.js',
        'Moleculer',
        'Dgraph',
        'Redis',
        'S3',
        'OpenAPI',
        'Docker',
        'Jest',
        'Bruno',
        'Vue.js',
      ],
    },
    {
      name: 'Система учёта рабочего времени',
      kind: 'WORK',
      experience: 'Шевиант',
      description:
        'Учёт рабочего времени сотрудников с гибким графиком: отметка по QR-коду на планшете, статистика и отчёты ' +
        'для руководителей, Telegram-версия клиента. Вёл проект как Team Lead — от согласования с заказчиком до деплоя ' +
        'и администрирования.',
      achievements: [
        'Полностью отвечал за техническую реализацию и архитектуру проекта; связал frontend и backend через REST, SSE и WebSocket.',
        'Переписал проект с JS на TS, внедрил логирование и построил расширяемую архитектуру Telegram-бота — ' +
          'новые фичи добавляются на 40% быстрее, отладка ускорилась.',
        'Переработал БД с переносом данных и интеграцией старой системы.',
        'Внедрил pub/sub на Redis и написал клиентскую часть с нуля.',
        'Вёл коммуникацию с бизнесом, формировал техническое задание и отчётность по срокам.',
      ],
      technologies: [
        'TypeScript',
        'Node.js',
        'Express',
        'TypeORM',
        'MySQL',
        'Redis',
        'Socket.IO',
        'Telegram Bot API',
        'Vue.js',
      ],
    },
    {
      name: 'Личный кабинет транспортной компании ПДВ',
      kind: 'WORK',
      experience: 'Шевиант',
      description:
        'Личный кабинет сотрудников и заказчиков транспортной компании (~1000 пользователей): заявки, транзакции, ' +
        'статистика, учёт рабочего времени, права доступа, интеграция с 1С. Бэкенд из нескольких сервисов на Express: ' +
        'основной API (Prisma, MySQL, очереди и cron-задачи), real-time-сервис на Socket.IO с pub/sub через Redis, ' +
        'генерация PDF через Puppeteer, Telegram-бот.',
      achievements: [
        'Внедрил логирование и аудит действий пользователей по всему проекту.',
        'Интегрировал личный кабинет с системой учёта рабочего времени сотрудников.',
        'Оптимизировал SQL-запросы и работу с ORM, что снизило время отклика системы на 20%.',
        'Внедрил покрытие тестами (Jest, Postman) и CI/CD-пайплайны с автоматическим прогоном тестов.',
      ],
      technologies: [
        'TypeScript',
        'Node.js',
        'Express',
        'Prisma',
        'MySQL',
        'Redis',
        'Socket.IO',
        'Puppeteer',
        'Telegram Bot API',
        'Vue.js',
        'Pinia',
        'Vite',
      ],
    },
    {
      name: 'Портал сотрудников завода ЗМИ',
      kind: 'WORK',
      experience: 'Шевиант',
      description:
        'Личный кабинет сотрудников завода (~2000 пользователей): новости, опросы, адаптация, ППУ, зарплата и столовая, ' +
        'заявки, производственная статистика. Отчёты в PDF и Excel, выгрузки из 1С, Telegram-бот, ' +
        'real-time-обновления через Socket.IO.',
      achievements: [
        'Интегрировал разнородные платформы в рамках автоматизации завода: мобильное приложение на телевизоре, API станков Siemens.',
        'Подключил станки по OPC UA и сделал статистику их работы.',
        'Сделал модуль, облегчающий работу конвейера.',
      ],
      technologies: [
        'JavaScript',
        'Node.js',
        'Express',
        'MongoDB',
        'Prisma',
        'OPC UA',
        'Socket.IO',
        'Puppeteer',
        'Telegram Bot API',
        'Vue.js',
        'Vite',
      ],
    },
    {
      name: 'Система контроля вывоза ТБО Green City',
      kind: 'WORK',
      experience: 'Экоинформ',
      repositoryUrl: 'https://github.com/Timovey/green-city',
      description:
        'Система для компании полного цикла вывоза мусора у организаций и частных клиентов: диспетчеризация, ' +
        'логистика и рейсы техники, графики сотрудников и машин, отчёты и документы. Микросервисы на ASP.NET ' +
        '(авторизация, диспетчер, логистика, расписания, отчёты, файлы) с EF Core и MS SQL, фоновые задачи на Hangfire, ' +
        'клиент на Nuxt + Vuetify. Проект был доведён до работы, но закрыт из-за законодательных требований ' +
        'к ЖКХ-компаниям.',
      achievements: [
        'Разработал с нуля frontend и backend личного кабинета таксировщика.',
        'Сделал алгоритм построения гибких графиков сотрудников и техники.',
        'Спроектировал реляционную БД (MS SQL), написал хранимые процедуры и триггеры для сложной бизнес-логики.',
        'Оптимизировал запросы backend- и frontend-части: интеграция ускорилась на 20%, количество обращений к API сократилось на 10%.',
        'Верстал адаптивные интерфейсы по макетам Figma, интегрировал UI-Kit.',
        'Презентовал заказчику готовые модули.',
      ],
      technologies: [
        'C#',
        '.NET',
        'Entity Framework Core',
        'MS SQL',
        'Hangfire',
        'Refit',
        'Docker',
        'Postman',
        'Nuxt',
        'Vuetify',
      ],
    },
  ],
};
