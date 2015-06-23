# API

attention: using javascript promises

### context.onEvent(event)

events

'variables' - on start call
'close' - on end session
'hangup' - on hangup channel


### context.answer()

### context.asyncagiBreak()

### context.channelStatus(channel)

### context.controlStreamFile(filename, escape_digits, skipms, ffchar, rewchr, pausechr, offsetms)
details https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+AGICommand_control+stream+file

### context.databaseDel(variable, value)

### context.databaseDeltree(key)

### context.databaseGet

### context.databasePut

### context.exec

### context.getData

### context.getFullVariable

### context.getOption

### context.getVariable

### context.gosub

### context.hangup

### context.noop

### context.receiveChar

### context.receiveText

### context.recordFile

### context.sayAlpha

### context.sayDate

### context.sayDatetime

### context.sayDigits

### context.sayNumber

### context.sayPhonetic

### context.sayTime

### context.sendImage

### context.sendText

### context.setAutohangup

### context.setCallerid

### context.setContext

### context.setExtension

### context.setMusic

### context.setPriority

### context.setVariable

### context.speechActivateGrammar

### context.speechCreate

### context.speechDeactivateGrammar

### context.speechDestroy

### context.speechLoadGrammar

### context.speechRecognize

### context.speechSet

### context.speechUnloadGrammar

### context.streamFile

### context.tddMode

### context.verbose

### context.waitForDigit

### context.exec(command, [args])

Dispatches the `EXEC` AGI command to asterisk with supplied command name and arguments.

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
context.hangup().
```
