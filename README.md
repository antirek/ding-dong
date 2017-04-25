# ding-dong

[![Build Status](https://travis-ci.org/antirek/ding-dong.svg?branch=master)](https://travis-ci.org/antirek/ding-dong)

Create AGI server with ding-dong. Use with Asterisk for fast telephony apps. 

[Fork of node-agi](http://github.com/brianc/node-agi)

stable version 0.1.1

unstable version 0.1.5


Use ding-dong
=============

[voicer](http://github.com/antirek/voicer) - AGI voice recognizer for Asterisk (use Yandex and Google speech recognizers)

[agi-number-archer](http://github.com/antirek/agi-number-archer) - AGI server for find region code of phone number (Russia)

[lcr-finder](http://github.com/antirek/lcr-finder) - least cost router for Asterisk



## Install

```
npm install ding-dong [--save]

```


## Usage

### Write app.js and run it

`````javascript

var AGIServer = require('ding-dong');

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

`````

### Add to Asterisk extensions.conf

`````
[default]
exten = > 1000,1,AGI(agi://localhost:3000)
`````

### And call to 1000 and view asterisk output. Profit!


## API 

see [API.md](API.md)


## Links

[Asterisk AGI](https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+AGI+Commands)