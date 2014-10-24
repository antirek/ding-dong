# node-agi

Client for asterisk AGI protocol.  Parses incomming messages into events.  Dispatches AGI commands and their responses from asterisk.  Most commonly used as a low level client for a fAGI server.

## note: still a work in progress

## install
```
npm install agi
```

## API

### agi.createServer([listener])

Returns a new net.Server instance.  The _listener_ will be called on a new agi connection with a single __Context__ object as described below.

```js
require('agi').createServer(function(context) {
  //context is a new instance of agi.Context for each new agi session
  //immedately after asterisk connects to the node process
  context.on('variables', function(vars) {
    console.log('received new call from: ' + vars.agi_callerid + ' with uniqueid: ' + vars.agi_uniqueid);
  });
}).listen(3000);
```

### new agi.Context(stream)

Constructor to create a new instance of a context.  Supply a readable and writable stream to the constructor.  Commonly _stream_ will be a `net.Socket` instance.

### context.exec(command, [args], [callback])

Dispatches the `EXEC` AGI command to asterisk with supplied command name and arguments.  _callback_ is called with the result of the dispatch.

```js
context.exec('ANSWER', function(err, res) {
  //the channel is now answered
});

context.exec('RecieveFax', '/tmp/myfax.tif', function(err, res) {
  //fax has been recieved by asterisk and written to /tmp/myfax.tif
});
```

### context.hangup([callbac])

Dispatches the 'HANGUP' AGI command to asterisk.  Does __not__ close the sockets automatically.  _callback_ is called with the result of the dispatch.

```js
context.hangup(function(err, res) {
  //the channel has now been hungup.
});
```
