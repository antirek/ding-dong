var Context = require('./context');

var agi = function (handler, optionsIn) {
  
  var server;
  var options = optionsIn || {};

  var settings = {
    port: options.port || 3000,
    debug: options.debug || false,
    host: options.host,
  };

  var handle = function (stream) {
    var context = new Context(stream, settings.debug);
    handler(context);
  };

  var start = function (portIn, hostIn) {
    var port = portIn || settings.port;
    var host = hostIn || settings.host;
    return require('net').createServer(handle).listen(port, host);
  }; 

  return {
    start: start
  };
};

module.exports = agi;
