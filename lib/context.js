var Readable = require('readable-stream');
var EventEmitter = require('events').EventEmitter;
var state = require('./state');

var Context = function(stream) {
  EventEmitter.call(this);
  this.stream = new Readable();
  this.stream.wrap(stream);
  this.state = state.init;
  this.msg = "";
  var self = this;
  this.stream.on('readable', function() {
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

Context.prototype.readVariables = function(msg) {
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

Context.prototype.readResponse = function(msg) {
  var lines = msg.split('\n');
  for(var i = 0; i < lines.length; i++) {
    this.readResponseLine(lines[i]);
  }
  return "";
};

Context.prototype.readResponseLine = function(line) {
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

Context.prototype.exec = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  var last = args.pop();
  if(typeof last !== 'function') {
    args.push(last);
    last = function() { }
  }
  this.send('EXEC ' + args.join(' ') + '\n', last);
};

Context.prototype.dial = function (num, timeout, params, cb) {
  this.exec('Dial', num + ',' + timeout + ',' + params, cb);
};

Context.prototype.getVariable = function (name, cb) {
  this.send('GET VARIABLE ' + name + '\n', cb || function() { });
};

Context.prototype.getFullVariable = function (variable, channel, cb) {
  this.send('GET FULL VARIABLE ' + variable + ' ' + channel + '\n', cb || function() { });
};

Context.prototype.setVariable = function (name, value, cb) {
  this.send('SET VARIABLE ' + name + ' ' + value + '\n', cb || function() { });
};

Context.prototype.channelStatus = function (name, cb) {
  this.send('CHANNEL STATUS ' + name + '\n', cb || function() { });
};

Context.prototype.answer = function (cb) {
  this.send('ANSWER' + '\n', cb || function() { });
};

Context.prototype.recordFile = function (filename, format, escape_digits, timeout, offset, beep, silence, cb) {
  var str = [
      '"'+filename+'"', 
      format, 
      escape_digits, 
      parseInt(timeout)*1000,
      offset,
      beep,
      silence 
    ].join(' ');
  this.send('RECORD FILE ' + str + '\n', cb || function() { });
};

Context.prototype.sayNumber = function(number, escape_digits, cb) {
  this.send('SAY NUMBER ' + number + ' "' + escape_digits + '"' + '\n', cb || function() { });
};

Context.prototype.sayDigits = function(digits, escape_digits, cb) {
  this.send('SAY DIGITS ' + digits + ' "' + escape_digits + '"' + '\n', cb || function() { });
};

Context.prototype.sayPhonetic = function(string, escape_digits, cb) {
  this.send('SAY PHONETIC ' + string + ' "' + escape_digits + '"' + '\n', cb || function() { });
};

Context.prototype.streamFile = function(filename, acceptDigits, cb) {
  if(typeof acceptDigits === 'function') {
    cb = acceptDigits;
    acceptDigits = "1234567890#*";
  }
  this.send('STREAM FILE "' + filename + '" "' + acceptDigits + '"\n', cb);
};

Context.prototype.waitForDigit = function(timeout, cb) {
  if(typeof timeout === 'function') {
    cb = timeout;
    //default to 2 second timeout
    timeout = 5000;
  }
  this.send('WAIT FOR DIGIT ' + timeout + '\n', cb);
};

Context.prototype.hangup = function(cb) {
  this.send('HANGUP\n', cb);
};

Context.prototype.end = function() {
  this.stream.end();
};

Context.prototype.asyncAGIBreak = function (cb) {
  this.send('ASYNCAGI BREAK\n', cb || function() { });
};

module.exports = Context;