# ding-dong

[![Build Status](https://travis-ci.org/antirek/ding-dong.svg?branch=master)](https://travis-ci.org/antirek/ding-dong)

node.js lib for Fast AGI (Asterisk Gateway Interface) server

[Fork of node-agi](http://github.com/brianc/node-agi)


Use ding-dong
=============

[voicer](http://github.com/antirek/voicer) - AGI voice recognizer for Asterisk (use Yandex and Google speech recognizers)

[agi-number-archer](http://github.com/antirek/agi-number-archer) - AGI server for find region code of phone number (Russia)

[lcr-finder](http://github.com/antirek/lcr-finder) - least cost router for Asterisk


## Install

```
npm install ding-dong

```

`````javascript

const AGIServer = require('ding-dong');

const handler = (context) => {
    context.onEvent('variables')
        .then((vars) => {
            return context.streamFile('beep');
        })
        .then((result) => {
            return context.setVariable('RECOGNITION_RESULT', 'I\'m your father, Luc');
        })
        .then((result) => {
            return context.close();
        });
};

var agi = new AGIServer(handler, {port: 3000});
agi.init();

`````

### Add to Asterisk extensions.conf

`````
[default]
exten = > 1000,1,AGI(agi://localhost:3000)
`````

## API 

see [API.md](API.md)


## Links

[Asterisk AGI](https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+AGI+Commands)