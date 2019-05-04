const Readable = require('readable-stream');
const EventEmitter = require('events').EventEmitter;
const state = require('./state');
const commands = require('./command');

// base context

const Context = function(conn, loggerOptions = {}) {
  EventEmitter.call(this);

  const consoleDecorator = function(arrow, data) {
    return console.log(arrow, JSON.stringify(data));
  };
  this.log = (loggerOptions.logger) ?
    loggerOptions.logger :
    consoleDecorator;


  this.debug = loggerOptions.debug;
  this.conn = conn;
  this.stream = new Readable(); 
  this.stream.setEncoding('utf8');
  this.stream.wrap(this.conn);
  this.state = state.init;

  this.msg = '';
  this.variables = {};
  this.pending = null;

  const self = this;
  this.stream.on('readable', function() {
    // always keep the 'leftover' part of the message
    self.msg = self.read();
  });

  this.stream.on('error', this.emit.bind(this, 'error'));
  this.stream.on('close', this.emit.bind(this, 'close'));
};

require('util').inherits(Context, EventEmitter);

Context.prototype.read = function() {
  const buffer = this.stream.read();
  if (!buffer) return this.msg;

  this.msg += buffer;

  if (this.state === state.init) {
    // we don't have whole message
    if (this.msg.indexOf('\n\n') < 0) return this.msg;
    this.readVariables(this.msg);
  } else if (this.state === state.waiting) {
    // we don't have whole message
    if (this.msg.indexOf('\n') < 0) return this.msg;
    this.readResponse(this.msg);
  }

  return '';
};

Context.prototype.readVariables = function(msg) {
  const lines = msg.split('\n');

  lines.map(function(line) {
    const split = line.split(':');
    const name = split[0];
    const value = split[1];
    this.variables[name] = (value || '').trim();
  }, this);

  this.emit('variables', this.variables);
  this.setState(state.waiting);
};

Context.prototype.readResponse = function(msg) {
  const lines = msg.split('\n');

  lines.map(function(line) {
    this.readResponseLine(line);
  }, this);
};

Context.prototype.readResponseLine = function(line) {
  if (!line) return;

  // var parsed = /^(\d{3})(?: result=)(.*)/.exec(line);
  const parsed = /^(\d{3})(?: result=)([^(]*)(?:\((.*)\))?/.exec(line);


  if (!parsed) {
    return this.emit('hangup');
  }

  const response = {
    code: parseInt(parsed[1]),
    result: parsed[2].trim(),
  };
  if (parsed[3]) {
    response.value = parsed[3];
  }

  // our last command had a pending callback
  if (this.pending) {
    const pending = this.pending;
    this.pending = null;
    pending(null, response);
  }
  this.emit('response', response);
};

Context.prototype.setState = function(state) {
  this.state = state;
};

Context.prototype.send = function(msg, cb) {
  this.pending = cb;
  this.stream.write(msg);
};

Context.prototype.close = function() {
  this.conn.destroy();
  this.stream.end();
  return Promise.resolve();
};

Context.prototype.sendCommand = function(command) {
  if (this.debug) this.log('------->', {command: command});
  const self = this;
  return new Promise(function(resolve, reject) {
    self.send(command + '\n', function(err, result) {
      if (self.debug) self.log('<-------', {err: err, result: result});
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

Context.prototype.onEvent = function(event) {
  const self = this;
  return new Promise(function(resolve) {
    self.on(event, function(data) {
      resolve(data);
    });
  });
};

// additional agi commands

commands.forEach(function(command) {
  let str = '';
  Context.prototype[command.name] = function(...args) {
    if (command.params > 0) {
      // const args = [].slice.call(arguments, 0, command.params);
      str = command.command + ' ' +
        prepareArgs(args, command.paramRules, command.params).join(' ');
    } else {
      str = command.command;
    }
    return this.sendCommand(str);
  };
});

const prepareArgs = function(args, argsRules, count) {
  if (!argsRules || !count) {
    return args;
  }

  return (new Array(count)).fill(null)
      .map(function(arg, i) {
        arg = args[i] !== undefined && args[i] !== null ?
            args[i] :
            argsRules[i] && argsRules[i].default || '';
        const prepare = argsRules[i] && argsRules[i].prepare ||
          function(x) {
            return x;
          };

        return prepare(String(arg));
      });
};

// sugar commands

Context.prototype.dial = function(target, timeout, params) {
  return this.exec('Dial', target + ',' + timeout + ',' + params);
};

module.exports = Context;
