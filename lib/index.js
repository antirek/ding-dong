var Context = require('./context');

var agi = function (handler) {
  
  var server;

  var handle = function (stream) {
    var context = new Context(stream);
    handler(context);
  };

  var start = function (port) {
    server = require('net').createServer(handle).listen(port);
  }; 

  return {
    start: start
  };
};

module.exports = agi;