/**
 ЗАДАЧА
 Написать HTTP-сервер для загрузки и получения файлов
 - Все файлы находятся в директории files
 - Структура файлов НЕ вложенная.

 - Виды запросов к серверу
   GET /file.ext
   - выдаёт файл file.ext из директории files,
   - правильный mime-type по содержимому (модуль mime)

   POST /file.ext
   - пишет всё тело запроса в файл files/file.ext и выдаёт ОК
   - если файл уже есть, то выдаёт ошибку 409
   - при превышении файлом размера 1MB выдаёт ошибку 413

 Вместо file может быть любое имя файла.
 Так как поддиректорий нет, то при наличии / или .. в пути сервер должен выдавать ошибку 400.

- Сервер должен корректно обрабатывать ошибки "файл не найден" и другие (ошибка чтения файла)
- index.html или curl для тестирования


 */

const SERVER_PORT = 3000;
const INDEX_PATH = '/public/index.html';
const FILES_PATH = '/public/files/';

const url = require('url');
const path = require('path');
const readFile = require('./read_file');
const writeFile = require('./write_file');

const fileRegExp = /^\/{1}[\w\-а-яА-я]+\.\w+/gi;

const server = require('http').createServer((req, res) => {
  try {
    const pathname = decodeURI(url.parse(req.url).pathname);
  } catch(err) {}
  

  switch (req.method) {
    case 'GET':
      if (pathname === '/') {
        return readFile(INDEX_PATH, res);
      }

      if (pathname.match(fileRegExp)) {
        readFile(path.join(FILES_PATH, pathname), res);
      } else {
        res.statusCode = 400;
        res.end('Bad request');
      }

      break;

    case 'POST':
      writeFile(path.join(FILES_PATH, pathname), req, res);

      break;

    default:
      res.statusCode = 502;
      res.end('Not implemented');
  }
}).listen(SERVER_PORT, () => {
  if (process.env.NODE_ENV === 'develop') {
    const emit = server.emit;
    server.emit = (...args) => {
      console.log(args[0]);
      return emit.apply(server, args);
    };

    console.log(`Staring server on port ${SERVER_PORT}`);
  }
});
