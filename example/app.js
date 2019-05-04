const AGIServer = require('./../lib/index');

const handler = (context) => {
  context.onEvent('variables')
      .then((vars) => {
        console.log('vars', vars);
        return context.streamFile('beep');
      })
      .then((result) => {
        return context.setVariable(
            'RECOGNITION_RESULT', 'I\'m your father, Luc');
      })
      .then((result) => {
        return context.end();
      })
      .fail(console.log);
};

const agi = new AGIServer(handler, {
  debug: true, 
  port: 3007
});
agi.init()