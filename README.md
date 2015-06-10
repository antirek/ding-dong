# ding-dong

[![Build Status](https://travis-ci.org/antirek/ding-dong.svg?branch=master)](https://travis-ci.org/antirek/ding-dong)

Create AGI server with ding-dong. Use with Asterisk for fast telephony apps. [Fork of node-agi](http://github.com/brianc/node-agi)

## Install

```
npm install ding-dong [--save]
```

## API

### ding.createServer([listener])

Returns a new net.Server instance.  The _listener_ will be called on a new agi connection with a single __Context__ object as described below.

`````
var ding = require('ding-dong');

ding.createServer(function(context) {
  context.onEvent('variables')
    .then(function(vars) {
      console.log('received new call from: ' + vars.agi_callerid + ' with uniqueid: ' + vars.agi_uniqueid);
    })
    .fail(console.log);
}).listen(3000);

`````

### Add to Asterisk extensions.conf

`````
[default]
exten = > 1000,1,AGI(agi://localhost:3000)
`````


attention: using javascript promises


### new ding.Context(stream)

Constructor to create a new instance of a context.  Supply a readable and writable stream to the constructor.  Commonly _stream_ will be a `net.Socket` instance.


### context.exec(command, [args])

Dispatches the `EXEC` AGI command to asterisk with supplied command name and arguments.  _callback_ is called with the result of the dispatch.

```js
context.exec('Dial', opt1, opt2, .., optN)
.then(function(result)
  //the channel call app Dial with options
});

context.exec('RecieveFax', '/tmp/myfax.tif')
.then(function(result) {
  //fax has been recieved by asterisk and written to /tmp/myfax.tif
});
```

### context.hangup()

Dispatches the 'HANGUP' AGI command to asterisk.  Does __not__ close the sockets automatically.  _callback_ is called with the result of the dispatch.

```js
context.hangup()
.then(function(){
    //do something
});
```


Use ding-dong
=============

[voicer](http://github.com/antirek/voicer) - AGI yandex voice recognizer for Asterisk

[agi-number-archer](http://github.com/antirek/agi-number-archer) - AGI server for find region code of phone number (Russia)

[lcr-finder](http://github.com/antirek/lcr-finder) - least cost router for Asterisk


## Links

[Asterisk AGI](https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+AGI+Commands)
