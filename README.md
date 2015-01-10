# ding-dong

Create AGI server with ding-dong. Use with Asterisk for fast telephony apps. [Fork of node-agi](http://github.com/brianc/node-agi)

## install

```
npm install ding-dong [--save]
```

## API

### ding.createServer([listener])

Returns a new net.Server instance.  The _listener_ will be called on a new agi connection with a single __Context__ object as described below.

```js
var ding = require('ding-dong');
ding.createServer(function(context) {
  context.on('variables', function(vars) {
    console.log('received new call from: ' + vars.agi_callerid + ' with uniqueid: ' + vars.agi_uniqueid);
  });
}).listen(3000);
```
### Add to Asterisk extensions.conf
`````
[default]
exten = > 1000,1,AGI(agi://localhost:3000)
`````


### new ding.Context(stream)

Constructor to create a new instance of a context.  Supply a readable and writable stream to the constructor.  Commonly _stream_ will be a `net.Socket` instance.

### context.exec(command, [args], [callback])

Dispatches the `EXEC` AGI command to asterisk with supplied command name and arguments.  _callback_ is called with the result of the dispatch.

```js
context.exec('Dial', opt1, opt2, .., optN, function(err, res) {
  //the channel call app Dial with options
});

context.exec('RecieveFax', '/tmp/myfax.tif', function(err, res) {
  //fax has been recieved by asterisk and written to /tmp/myfax.tif
});
```

### context.hangup([callback])

Dispatches the 'HANGUP' AGI command to asterisk.  Does __not__ close the sockets automatically.  _callback_ is called with the result of the dispatch.

```js
context.hangup(function(err, res) {
  //the channel has now been hungup.
});
```


## Projects

[Voicer](http://github.com/antirek/voicer) - AGI yandex voice recognizer for Asterisk

## Links

[Asterisk AGI](https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+AGI+Commands)
