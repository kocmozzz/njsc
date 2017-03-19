const path = require('path');
const { ReadStream } = require('fs');
const { getMeta } = require('./file_meta');

function errorHandler(err, res) {
  process.env.NODE_ENV === 'develop' && console.log(err);

  if (err && (err.code === 'ENOENT' || err.code === 'EISDIR')) {
    res.statusCode = 404;
    res.end('File not found');
  } else {
    res.statusCode = 500;
    res.end('Server error');
  }
}

module.exports = function readFile(filePath, res) {
  filePath = path.normalize(filePath);

  const { encoding, contentType } = getMeta(filePath);
  const stream = new ReadStream(filePath, { encoding });

  stream
    .on('open', () => {
      res.setHeader('Content-Type', contentType);
    })
    .on('close', (err) => { errorHandler(err, res); })
    .on('error', (err) => { errorHandler(err, res); })
    .on('end', () => { res.end(); })
    .pipe(res);

  res.on('close', () => { stream.destroy(); });
};
