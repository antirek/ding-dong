var Readable = require('readable-stream');
var EventEmitter = require('events').EventEmitter;
var state = require('./state');
var Q = require('q');

var Context = function (stream) {
  EventEmitter.call(this);
  this.stream = new Readable();
  this.stream.wrap(stream);
  this.state = state.init;
  this.msg = "";
  var self = this;
  this.stream.on('readable', function () {
    //always keep the 'leftover' part of the message
    self.msg = self.read();
  });
  this.msg = this.read();
  this.variables = {};
  this.pending = null;
  this.stream.on('error', this.emit.bind(this, 'error'));
  this.stream.on('close', this.emit.bind(this, 'close'));
};

require('util').inherits(Context, EventEmitter);

Context.prototype.read = function() {
  var buffer = this.stream.read();
  if(!buffer) return this.msg;
  this.msg += buffer.toString('utf8');
  if(this.state === state.init) {
    if(this.msg.indexOf('\n\n') < 0) return this.msg; //we don't have whole message
    this.readVariables(this.msg);
  } else if(this.state === state.waiting) {
    if(this.msg.indexOf('\n') < 0) return this.msg; //we don't have whole message
    this.readResponse(this.msg);
  }
  return "";
};

Context.prototype.readVariables = function (msg) {
  var lines = msg.split('\n');
  for(var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var split = line.split(':')
    var name = split[0];
    var value = split[1];
    this.variables[name] = (value||'').trim();
  }
  this.emit('variables', this.variables);
  this.setState(state.waiting);
  return "";
};

Context.prototype.readResponse = function (msg) {
  var lines = msg.split('\n');
  for(var i = 0; i < lines.length; i++) {
    this.readResponseLine(lines[i]);
  }
  return "";
};

Context.prototype.readResponseLine = function (line) {
  if(!line) return;
  
  var parsed = /^(\d{3})(?: result=)(.*)/.exec(line);

  if(!parsed) {
    return this.emit('hangup');
  }
  var response = {
    code: parseInt(parsed[1]),
    result: parsed[2]
  };

  //our last command had a pending callback
  if(this.pending) {
    var pending = this.pending;
    this.pending = null;
    pending(null, response);
  }
  this.emit('response', response);
}

Context.prototype.setState = function(state) {
  this.state = state;
};

Context.prototype.send = function(msg, cb) {
  this.pending = cb;
  this.stream.write(msg);
};

Context.prototype.end = function () {
  this.stream.end();
  return Q.resolve();
};

Context.prototype.exec = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  var last = args.pop();
  if(typeof last !== 'function') {
    args.push(last);
    last = function () { }
  }
  this.send('EXEC ' + args.join(' ') + '\n', last);
};

Context.prototype.sendCommand = function (command) {
  var defer = new Q.defer();
  this.send(command + '\n', function (err, result){
    if (err) {
      defer.reject(err);
    } else {
      defer.resolve(result);
    }
  });
  return defer.promise;
};

Context.prototype.onEvent = function (event) {
  var defer = new Q.defer();
  this.on(event, function (data) {
    defer.resolve(data);
  });
  return defer.promise;
}

Context.prototype.dial = function (num, timeout, params, cb) {
  this.exec('Dial', num + ',' + timeout + ',' + params, cb);
};

Context.prototype.databaseDel = function (family, key) {
  return this.sendCommand('DATABASE DEL ' + family + ' ' + key);
};

Context.prototype.databaseDelTree = function (family, keytree) {
  return this.sendCommand('DATABASE DELTREE ' + family + ' ' + keytree);
};

Context.prototype.databaseGet = function (family, key) {
  return this.sendCommand('DATABASE GET ' + family + ' ' + key);
};

Context.prototype.databasePut = function (family, key, value) {
  return this.sendCommand('DATABASE PUT ' + family + ' ' + key + ' ' + value);
};

Context.prototype.speechCreate = function (engine) {
  return this.sendCommand('SPEECH CREATE ' + engine);
};

Context.prototype.speechDestroy = function () {
  return this.sendCommand('SPEECH DESTROY');
};

Context.prototype.speechActivateGrammar = function (name) {
  return this.sendCommand('SPEECH ACTIVATE GRAMMAR ' + name);
};

Context.prototype.speechDeactivateGrammar = function (name) {
  return this.sendCommand('SPEECH DEACTIVATE GRAMMAR ' + name);
};

Context.prototype.speechLoadGrammar = function (name, path) {
  return this.sendCommand('SPEECH LOAD GRAMMAR ' + name + ' ' + path);
};

Context.prototype.speechUnloadGrammar = function (name) {
  return this.sendCommand('SPEECH UNLOAD GRAMMAR ' + name);
};

Context.prototype.speechSet = function (name, value) {
  return this.sendCommand('SPEECH SET ' + name + ' ' + value);
};

Context.prototype.speechRecognize = function (prompt, timeout, offset) {
  return this.sendCommand('SPEECH RECOGNIZE ' + prompt + ' ' + timeout + ' ' + offset);
};

Context.prototype.getVariable = function (name) {
  return this.sendCommand('GET VARIABLE ' + name);
};

Context.prototype.getFullVariable = function (variable, channel) {
  return this.sendCommand('GET FULL VARIABLE ' + variable + ' ' + channel);
};

Context.prototype.getData = function (file, timeout, maxdigits) {
  return this.sendCommand('GET DATA ' + file + ' ' + timeout + ' ' + maxdigits);
};

Context.prototype.getOption = function (file, escape_digits, timeout) {
  return this.sendCommand('GET OPTION ' + file + ' "' + escape_digits + '" ' + timeout);
};

Context.prototype.receiveChar = function (timeout) {
  return this.sendCommand('RECEIVE CHAR ' + timeout);
};

Context.prototype.receiveText = function (timeout) {
  return this.sendCommand('RECEIVE TEXT ' + timeout);
};

Context.prototype.setAutoHangup = function (seconds) {
  return this.sendCommand('SET AUTOHANGUP ' + seconds);
};

Context.prototype.setCallerID = function (number) {
  return this.sendCommand('SET CALLERID ' + number);
};

Context.prototype.setContext = function (context) {
  return this.sendCommand('SET CONTEXT ' + context);
};

Context.prototype.setExtension = function (extension) {
  return this.sendCommand('SET EXTENSION ' + extension);
};

Context.prototype.setPriority = function (priority) {
  return this.sendCommand('SET PRIORITY ' + priority);
};

Context.prototype.setMusic = function (musicclass) {
  return this.sendCommand('SET MUSIC ' + musicclass);
};

Context.prototype.setVariable = function (name, value) {
  return this.sendCommand('SET VARIABLE ' + name + ' ' + value);
};

Context.prototype.sendImage = function (image) {
  return this.sendCommand('SEND IMAGE ' + image);
};

Context.prototype.sendText = function (text) {
  return this.sendCommand('SEND TEXT "' + text + '"');
};

Context.prototype.channelStatus = function (name) {
  return this.sendCommand('CHANNEL STATUS ' + name);
};

Context.prototype.answer = function () {
  return this.sendCommand('ANSWER');
};

Context.prototype.verbose = function (message, level) {
  return this.sendCommand('VERBOSE "' + message + '" ' + level);
};

Context.prototype.tddMode = function (value) {
  return this.sendCommand('TDD MODE ' + value);
};

Context.prototype.noop = function (cb) {
  return this.sendCommand('NOOP');
};

Context.prototype.gosub = function (context, extension, priority, option) {
  var str = [context, extension, priority, option].join(' ');
  return this.sendCommand('GOSUB ' + str);
};

Context.prototype.recordFile = function (filename, format, escape_digits, timeout, offset, beep, silence) {
  var str = [
      '"' + filename + '"', 
      format, 
      escape_digits, 
      parseInt(timeout)*1000,
      offset,
      beep,
      silence 
    ].join(' ');
  return this.sendCommand('RECORD FILE ' + str);
};

Context.prototype.sayNumber = function (number, escape_digits) {
  return this.sendCommand('SAY NUMBER ' + number + ' "' + escape_digits + '"');
};

Context.prototype.sayAlpha = function (number, escape_digits) {
  return this.sendCommand('SAY ALPHA ' + number + ' "' + escape_digits + '"');
};

Context.prototype.sayDate = function (seconds, escape_digits) {   //seconds since 1.01.1970
  return this.sendCommand('SAY DATE ' + seconds + ' "' + escape_digits + '"');
};

Context.prototype.sayTime = function (seconds, escape_digits) {   //seconds since 1.01.1970
  return this.sendCommand('SAY TIME ' + seconds + ' "' + escape_digits + '"');
};

Context.prototype.sayDateTime = function (seconds, escape_digits, format, timezone) {   //seconds since 1.01.1970
  return this.sendCommand('SAY DATETIME ' + seconds + ' "' + escape_digits + '" ' + format + ' ' + timezone);
};

Context.prototype.sayDigits = function (digits, escape_digits) {
  return this.sendCommand('SAY DIGITS ' + digits + ' "' + escape_digits + '"');
};

Context.prototype.sayPhonetic = function (string, escape_digits) {
  return this.sendCommand('SAY PHONETIC ' + string + ' "' + escape_digits + '"');
};

Context.prototype.streamFile = function (filename, digits) {
  var acceptDigits = digits ? digits : "1234567890#*";
  return this.sendCommand('STREAM FILE "' + filename + '" "' + acceptDigits + '"');
};

Context.prototype.waitForDigit = function (timeoutIn) {
  var timeout = timeoutIn ? timeoutIn : 5000;
  return this.sendCommand('WAIT FOR DIGIT ' + timeout);
};

Context.prototype.hangup = function () {
  return this.sendCommand('HANGUP');
};

Context.prototype.asyncAGIBreak = function () {
  return this.sendCommand('ASYNCAGI BREAK');
};

module.exports = Context;