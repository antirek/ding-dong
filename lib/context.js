var Readable = require('readable-stream');
var EventEmitter = require('events').EventEmitter;
var state = require('./state');
var Q = require('q');
var commands = require('./command');

var Context = function (stream, debug) {
  EventEmitter.call(this);
  this.debug = debug;
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

Context.prototype.sendCommand = function (command) {
  var defer = new Q.defer();
  if (this.debug) console.log('command', command);
  var self = this;
  this.send(command + '\n', function (err, result) {
    if (self.debug) console.log('err:', err, 'result:', result);
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
};

Context.prototype.dial = function (num, timeout, params) {
  return this.exec('Dial', num + ',' + timeout + ',' + params);
};

commands.map(function (command) { 
  var str = '';
  Context.prototype[command.name] = function () {
    if (command.params > 0) {
      var args = [].slice.call(arguments, 0, command.params);
      str = command.command + " " + prepareArgs(args, command.paramRules).join(" ");
    } else {
      str = command.command;
    }
    return this.sendCommand(str);
  };
});

var prepareArgs = function(args, argsRules){
  var q;  
  if (argsRules) {
    q = args.map(function (arg, i) {
      return (argsRules[i]) ? argsRules[i].prepare(arg) : arg;
    });
  } else {
    q = args;
  }
  return q;
}

module.exports = Context;