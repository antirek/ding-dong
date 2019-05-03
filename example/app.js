const AGIServer = require('./../lib/index');

const handler = function(context) {
  context.onEvent('variables')
      .then(function(vars) {
        console.log('vars', vars);
        return context.streamFile('beep');
      })
      .then(function(result) {
        return context.setVariable(
            'RECOGNITION_RESULT', 'I\'m your father, Luc');
      })
      .then(function(result) {
        return context.end();
      })
      .fail(console.log);
};

const agi = new AGIServer(handler, {debug: true});
agi.start(3007);
