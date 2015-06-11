var AGIServer = require('./../lib/index');

var handler = function (context) {
    context.onEvent('variables')
        .then(function (vars) {
            return context.streamFile('beep');
        })
        .then(function (result) {
            return context.setVariable('RECOGNITION_RESULT', 'I\'m your father, Luc');
        })
        .then(function (result) {       
            return context.end();
        });
};

var agi = new AGIServer(handler);
agi.start(3000);