var Context = require('./context');

var agi = {
  state: require('./state'),
  Context: Context,
  createServer: function(handler) {
    return require('net').createServer(function(stream) {
      var context = new Context(stream);
      handler(context);
    });
  }
};

module.exports = agi;
