var Readable = require('readable-stream');
var EventEmitter = require('events').EventEmitter;
var state = require('./state');
var Q = require('q');
var commands = require('./command');

//base context

var Context = function (stream, debug) {
  EventEmitter.call(this);

  this.debug = debug;
  
  this.stream = new Readable();
  this.stream.setEncoding('utf8');
  this.stream.wrap(stream);
  this.state = state.init;
  
  this.msg = "";
  this.variables = {};
  this.pending = null;
  
  var self = this;
  this.stream.on('readable', function () {
    //always keep the 'leftover' part of the message    
    self.msg = self.read();
  });
    
  this.stream.on('error', this.emit.bind(this, 'error'));
  this.stream.on('close', this.emit.bind(this, 'close'));
};

require('util').inherits(Context, EventEmitter);

Context.prototype.read = function () {
  var buffer = this.stream.read();  
  if (!buffer) return this.msg;
  
  this.msg += buffer;
  
  if (this.state === state.init) {
    if (this.msg.indexOf('\n\n') < 0) return this.msg; //we don't have whole message
    this.readVariables(this.msg);
  } else if (this.state === state.waiting) {
    if (this.msg.indexOf('\n') < 0) return this.msg; //we don't have whole message
    this.readResponse(this.msg);
  }
  
  return '';
};

Context.prototype.readVariables = function (msg) {
  var lines = msg.split('\n'); 

  lines.map(function (line) {
    var split = line.split(':');
    var name = split[0];
    var value = split[1];
    this.variables[name] = (value || '').trim();
  }, this);

  this.emit('variables', this.variables);
  this.setState(state.waiting);
};

Context.prototype.readResponse = function (msg) {
  var lines = msg.split('\n');
  
  lines.map(function (line) {
    this.readResponseLine(line);
  }, this);
};

Context.prototype.readResponseLine = function (line) {
  if (!line) return;
  
  //var parsed = /^(\d{3})(?: result=)(.*)/.exec(line);
  var parsed = /^(\d{3})(?: result=)([^(]*)(?:\((.*)\))?/.exec(line);
  

  if (!parsed) {
    return this.emit('hangup');
  }

  var response = {
    code: parseInt(parsed[1]),
    result: parsed[2].trim(),
  };
  if (parsed[3]) {
    response.value = parsed[3];
  }

  //our last command had a pending callback
  if (this.pending) {
    var pending = this.pending;
    this.pending = null;
    pending(null, response);
  }
  this.emit('response', response);
}

Context.prototype.setState = function (state) {
  this.state = state;
};

Context.prototype.send = function (msg, cb) {
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

//additional agi commands

commands.forEach(function (command) { 
  var str = '';
  Context.prototype[command.name] = function () {
    if (command.params > 0) {
      var args = [].slice.call(arguments, 0, command.params);
      str = command.command + " " + prepareArgs(args, command.paramRules, command.params).join(" ");
    } else {
      str = command.command;
    }
    return this.sendCommand(str);
  };
});

var prepareArgs = function (args, argsRules, count) {
  if (!argsRules || !count) {
    return args;
  }

  return Array.apply(null, new Array(count)) // old node.js versions don't support Array.fill()
    .map(function (arg, i) {
      arg = args[i] !== undefined && args[i] !== null ? args[i] : argsRules[i] && argsRules[i].default || '';
      var prepare = argsRules[i] && argsRules[i].prepare || function (x) { return x; };
      return prepare(String(arg));
    });
};

//sugar commands

Context.prototype.dial = function (target, timeout, params) {
  return this.exec('Dial', target + ',' + timeout + ',' + params);
};

module.exports = Context;
