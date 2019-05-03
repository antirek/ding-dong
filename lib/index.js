const Context = require('./context');

const agi = function(handler, optionsIn) {
  const options = optionsIn || {};

  const settings = {
    port: options.port || 3000,
    debug: options.debug || false,
    logger: options.logger || false,
    host: options.host,
  };

  const handle = function(stream) {
    const context = new Context(stream, {
      debug: settings.debug,
      logger: options.logger,
    });

    handler(context);
  };

  const start = function(portIn, hostIn) {
    const port = portIn || settings.port;
    const host = hostIn || settings.host;
    return require('net').createServer(handle).listen(port, host);
  };

  return {
    start: start,
  };
};

module.exports = agi;
