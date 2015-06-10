var ding = require('./lib/index');

var handler = function (context) {
  context.onEvent('variables')
  .then(function (vars) {
    return context.streamFile('beep');
  });
};

ding.createServer(handler).listen(3000);
