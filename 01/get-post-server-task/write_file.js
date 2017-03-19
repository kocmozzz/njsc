const path = require('path');
const fs = require('fs');
const config = require('config');

const MAX_FILE_SIZE = config.get('limitFileSize');

const { WriteStream } = fs;

module.exports = function writeFile(filepath, req, res) {
  if (req.headers['content-length'] > MAX_FILE_SIZE) {
    console.log(req.headers['content-length']);
    res.statusCode = 413;
    res.end('File is too big.');
    return;
  }

  const filePath = path.normalize(filepath);
  const stream = new WriteStream(filePath, { flags: 'wx' });
  let size = 0;

  stream
    .on('error', (err) => {
      if (err.code === 'EEXIST') {
        res.statusCode = 409;
        res.end('File already exists');
      } else {
        stream.desroy();

        if (!res.headersSent) {
          res.writeHead(500, { 'Connection': 'close' });
        }

        res.statusCode = 500;
        res.end('File upload error');

        fs.unlink(filePath);
      }
    })
    .on('close', () => { res.end('File uploaded'); });

  req
    .on('data', (chunk) => {
      size += chunk.length;

      if (size > MAX_FILE_SIZE) {
        console.log('summ: ' + size);
        fs.unlink(filePath);
        res.setHeader('Connection', 'close');
        res.statusCode = 413;
        res.end('File is too big.');
      }
    })
    .on('close', () => {
      stream.desroy();
      fs.unlink(filePath);
      res.statusCode = 415;
      res.end('File upload aborted');
    })
    .pipe(stream);
};
