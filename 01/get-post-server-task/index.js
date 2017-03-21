const server = require('./server');
const config = require('config');

server.listen(config.get('serverPort'), () => {
  if (process.env.NODE_ENV === 'develop') {
    const emit = server.emit;
    server.emit = (...args) => {
      console.log(args[0]);
      return emit.apply(server, args);
    };

    console.log(`Staring server on port ${config.get('serverPort')}`);
  }
});
