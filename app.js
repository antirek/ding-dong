var AGIServer = require('./lib/index');

var handler = function (context) {
  context.onEvent('variables')
    .then(function (vars) {
      return context.streamFile('beep');
    });
};

var agi = new AGIServer(handler);
agi.start(3000);

//ding.createServer(handler).listen(3000);
