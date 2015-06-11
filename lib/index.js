var Context = require('./context');

var agi = function (handler, optionsIn) {
  
  var server;
  var options = optionsIn || {};

  var settings = {
    port: options.port || 3000,
    debug: options.debug || false
  };

  var handle = function (stream) {
    var context = new Context(stream, settings.debug);
    handler(context);
  };

  var start = function (portIn) {
    var port = portIn || settings.port;
    return require('net').createServer(handle).listen(port);
  }; 

  return {
    start: start
  };
};

module.exports = agi;