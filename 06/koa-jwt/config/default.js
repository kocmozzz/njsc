module.exports = {
  // secret data can be moved to env variables
  // or a separate config
  secret: 'mysecret',
  root: process.cwd(),
  appPort: 3000,
  dbConnection: 'mongodb://localhost/test',
  crypto: {
    hash: {
      length: 128,
      iterations: process.env.NODE_ENV === 'production' ? 12000 : 1
    }
  }
};
