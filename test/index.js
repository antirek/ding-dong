var MemoryStream = require('memstream').MemoryStream;
var agi = require('./../lib')
var expect = require('expect.js');
var Context = agi.Context;
var state = agi.state;

//helpers
var writeVars = function(stream) {
  stream.write('agi_network: yes\n');
  stream.write('agi_uniqueid: 13507138.14\n');
  stream.write('agi_arg_1: test\n');
  stream.write('\n\n');
};

var context = function(cb) {
  var stream = new MemoryStream();
  var ctx = new Context(stream);
  //TODO nasty
  ctx.send = function(msg, cb) {
    ctx.pending = cb;
    ctx.sent = ctx.sent || [];
    ctx.sent.push(msg);
  };
  ctx.once('variables', function(vars) {
    cb(ctx);
  });
  writeVars(stream);
};

describe('Context', function() {
  beforeEach(function(done) {
    var self = this;
    context(function(context) {
      self.context = context;
      done();
    });
  });

  describe('parsing variables', function() {
    it('works', function(done) {
      var vars = this.context.variables;
      expect(vars['agi_network']).ok();
      expect(vars['agi_network']).to.eql('yes');
      expect(vars['agi_uniqueid']).to.eql('13507138.14');
      expect(vars['agi_arg_1']).to.eql('test');
      done();

    });

    it('puts context into waiting state', function() {
      expect(this.context.state).to.eql(state.waiting);
    });
  });

  describe('sending command', function() {
    it('writes out', function() {
      this.context.send('EXEC test');
      expect(this.context.sent.length).to.eql(1);
      expect(this.context.sent.join('')).to.eql('EXEC test');
    });
  });

  describe('context.exec', function() {
    it('sends exec command', function() {
      this.context.exec('test', 'bang', 'another');
      expect(this.context.sent.join('')).to.eql('EXEC test bang another\n');
    });
  });

  describe('command flow', function() {
    describe('success', function() {
      it('emits proper repsonse', function(done) {
        var context = this.context;
        
        process.nextTick(function() {
          context.exec('test', 'bang', 'another');
          context.stream.write('200');
          context.stream.write(' result=0\n\n');
        });

        context.on('response', function(msg) {
          expect(msg.code).to.equal(200);
          expect(msg.result).to.eql('0');
          done();
        });

      });

      it('invokes callback with response', function(done) {
        var context = this.context;

        process.nextTick(function(){
          context.stream.write('200 result=0');
          context.stream.write('\n');
          context.stream.write('200 result=0');
          context.stream.write('\n');
        });

        context.exec('test', 'boom', function(err, res) {
          done(err);
        });
      });
    });

    describe('two commands', function(done) {

      it('invokes two callbacks', function(done) {
        var context = this.context;

        process.nextTick(function() {
          context.stream.write('200 result=0\n');
        });

        context.exec('test', function(err, res) {
          expect(res.result).to.eql('0');

          context.exec('test 2', function(err, res) {
            expect(res.result).to.eql('1');
            done();
          });
          
          process.nextTick(function() {
            context.stream.write('200 result=1\n');
          });
        });
      });
    });
  });

  describe('hangup', function() {
    it('raises hangup on context', function(done) {
      this.context.on('hangup', done);
      this.context.stream.write('HANGUP\n');
    });

    describe('in command response', function() {
      it('is passed to callback', function(done) {
        var context = this.context;
        this.context.exec('whatever', function(err, res) {
        });
        this.context.on('hangup', done);
        process.nextTick(function() {
          context.stream.write('200 result=-1\nHANGUP\n');
        })
      });
    });
  });

  describe('getVariable', function() {
    it('sends correct command', function() {
      this.context.getVariable('test');
      expect(this.context.sent.join('')).to.eql('GET VARIABLE test\n');
    });

    it('gets result', function(done) {
      this.context.getVariable('test', function(err, res) {
        expect(res.result).eql('1 (abcd)');
        done();
      });
      var self = this;
      process.nextTick(function() {
        self.context.stream.write('200 result=1 (abcd)\n');
      })
    });
  });

  describe('stream file', function() {
    it('sends', function() {
      this.context.streamFile('test', '1234567890#*', function() {});
      expect(this.context.sent.join('')).to.eql('STREAM FILE "test" "1234567890#*"\n');
    });

    it('defaults to all digits', function() {
      this.context.streamFile('test', function() {});
      expect(this.context.sent.join('')).to.eql('STREAM FILE "test" "1234567890#*"\n');

    });
  });

  describe('waitForDigit', function() {
    it('sends with default timeout', function() {
      this.context.waitForDigit(function() {});
      expect(this.context.sent.join('')).to.eql('WAIT FOR DIGIT 5000\n');
    });

    it('sends with specified timeout', function() {
      this.context.waitForDigit(-1, function() {});
      expect(this.context.sent.join('')).to.eql('WAIT FOR DIGIT -1\n');
    });
  });

  describe('hangup', function() {
    it('sends "HANGUP\\n"', function() {
      this.context.hangup();
      expect(this.context.sent.join('')).to.eql('HANGUP\n');
    });
  });

  describe('events', function() {
    describe('error', function () {
      it('is emitted when socket emits error', function(done) {
        this.context.on('error', function(err) {
          expect(err).to.eql('test');
          done();
        });
        this.context.stream.emit('error', "test");
      });
    });

    describe('close', function() {
      it('is emitted when socket emits close', function(done) {
        this.context.on('close', function(hasError) {
          expect(hasError).ok();
          done();
        });

        this.context.stream.emit('close', true);
      });
    });
  });
});

describe('agi#createServer', function() {
  it('returns instance of net.Server', function() {
    var net = require('net');
    var server = agi.createServer();
    expect(server instanceof net.Server).ok();
  });

  it('invokes callback when a new connection is established', function(done) {
    var server = agi.createServer(function(context) {
      expect(context instanceof agi.Context);
      done();
    });

    server.emit('connection', new MemoryStream());
  });
});
