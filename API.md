# API

attention: using javascript promises

### context.onEvent(event)

events

'variables' - on start call
'close' - on end session
'hangup' - on hangup channel


### context.[command]

command like:

answer
asyncagiBreak
channelStatus
controlStreamFile
databaseDel
databaseDeltree
databaseGet
databasePut
exec
getData
getFullVariable
getOption
getVariable
gosub
hangup
noop
receiveChar
receiveText
recordFile
sayAlpha
sayDate
sayDatetime
sayDigits
sayNumber
sayPhonetic
sayTime
sendImage
sendText
setAutohangup
setCallerid
setContext
setExtension
setMusic
setPriority
setVariable
speechActivateGrammar
speechCreate
speechDeactivateGrammar
speechDestroy
speechLoadGrammar
speechRecognize
speechSet
speechUnloadGrammar
streamFile
tddMode
verbose
waitForDigit


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
context.hangup().
```
