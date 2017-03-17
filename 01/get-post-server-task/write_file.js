const path = require('path');
const fs = require('fs');

const MAX_FILE_SIZE = 10e6;

const { WriteStream } = fs;

module.exports = function writeFile(filepath, req, res) {
  if (req.headers['content-length'] > MAX_FILE_SIZE) {
    res.statusCode = 413;
    res.end('File is too big.');
    return;
  }

  const filePath = path.normalize(path.join(__dirname, filepath));
  const stream = new WriteStream(filePath, { flags: 'wx' });
  let size = 0;

  stream
    .on('error', (err) => {
      if (err.code === 'EEXIST') {
        res.statusCode = 409;
        res.end('File already exists');
      } else {
        stream.desroy();

        fs.unlink(filePath);

        res.statusCode = 500;
        res.end('File upload error');
      }
    })
    .on('close', () => { res.end('File uploaded'); });

  req
    .on('data', (chunk) => {
      size += chunk.length;

      if (size > MAX_FILE_SIZE) {
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
