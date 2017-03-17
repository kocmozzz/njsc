const mime = require('mime');

function getMimeType(path) {
  return mime.lookup(path);
}

function getEncoding(mimeType) {
  return mime.charsets.lookup(mimeType);
}

function getMeta(path) {
  const mimeType = getMimeType(path);
  const encoding = getEncoding(mimeType);
  let contentType = mimeType;

  if (encoding) {
    contentType += `; charset=${encoding}`;
  }

  return { mimeType, encoding, contentType };
}

module.exports = { getMimeType, getEncoding, getMeta };
