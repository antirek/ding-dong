var MemoryStream = require('memorystream');
var agi = require('./../lib')
var expect = require('expect.js');
var Context = require('./../lib/context');
var state = require('./../lib/state');

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
  beforeEach(function (done) {
    var self = this;
    context(function (context) {
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

        context.exec('test', 'boom').then(function(){
          done();
        });
        
      });

      it('includes the response value', function(done) {
        var context = this.context;

        process.nextTick(function() {
          context.exec('test', 'bang', 'another');
          context.stream.write('200');
          context.stream.write(' result=0 (a value)\n\n');
        });

        context.on('response', function(msg) {
          expect(msg.code).to.equal(200);
          expect(msg.result).to.eql('0');
          expect(msg.value).to.eql('a value');
          done();
        });

      });
    });

    describe('two commands', function(done) {

      it('invokes two callbacks', function(done) {
        var context = this.context;

        process.nextTick(function() {
          context.stream.write('200 result=0\n');
        });

        context.exec('test')
          .then(function (res) {
            expect(res.result).to.eql('0');
            return context.exec('test 2');
          })
          .then(function (res) {
            expect(res.result).to.eql('1');
            done();
          });
          
        process.nextTick(function() {
          context.stream.write('200 result=1\n');
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

  describe('databaseDel', function() {
    it('sends correct command', function() {
      this.context.databaseDel('family', 'test');
      expect(this.context.sent.join('')).to.eql('DATABASE DEL family test\n');
    });
  });

  describe('databaseDelTree', function() {
    it('sends correct command', function() {
      this.context.databaseDelTree('family', 'test');
      expect(this.context.sent.join('')).to.eql('DATABASE DELTREE family test\n');
    });
  });

  describe('databaseGet', function() {
    it('sends correct command', function() {
      this.context.databaseGet('family', 'test');
      expect(this.context.sent.join('')).to.eql('DATABASE GET family test\n');
    });
  });

  describe('databasePut', function() {
    it('sends correct command', function() {
      this.context.databasePut('family', 'test', 'value');
      expect(this.context.sent.join('')).to.eql('DATABASE PUT family test value\n');
    });
  });

  describe('speechCreate', function() {
    it('sends correct command', function() {
      this.context.speechCreate('engine');
      expect(this.context.sent.join('')).to.eql('SPEECH CREATE engine\n');
    });
  });

  describe('speechDestroy', function() {
    it('sends correct command', function() {
      this.context.speechDestroy();
      expect(this.context.sent.join('')).to.eql('SPEECH DESTROY\n');
    });
  });

  describe('speechActivateGrammar', function() {
    it('sends correct command', function() {
      this.context.speechActivateGrammar('name');
      expect(this.context.sent.join('')).to.eql('SPEECH ACTIVATE GRAMMAR name\n');
    });
  });

  describe('speechDeactivateGrammar', function() {
    it('sends correct command', function() {
      this.context.speechDeactivateGrammar('name');
      expect(this.context.sent.join('')).to.eql('SPEECH DEACTIVATE GRAMMAR name\n');
    });
  });

  describe('speechLoadGrammar', function() {
    it('sends correct command', function() {
      this.context.speechLoadGrammar('name', 'path');
      expect(this.context.sent.join('')).to.eql('SPEECH LOAD GRAMMAR name path\n');
    });
  });

  describe('speechUnloadGrammar', function() {
    it('sends correct command', function() {
      this.context.speechUnloadGrammar('name');
      expect(this.context.sent.join('')).to.eql('SPEECH UNLOAD GRAMMAR name\n');
    });
  });

  describe('speechSet', function() {
    it('sends correct command', function() {
      this.context.speechSet('name', 'value');
      expect(this.context.sent.join('')).to.eql('SPEECH SET name value\n');
    });
  });

  describe('speechRecognize', function() {
    it('sends correct command', function() {
      this.context.speechRecognize('prompt', 'timeout', 'offset');
      expect(this.context.sent.join('')).to.eql('SPEECH RECOGNIZE prompt timeout offset\n');
    });
  });

  describe('setVariable', function() {
    it('sends correct command', function() {
      this.context.setVariable('test', 'test test test');
      expect(this.context.sent.join('')).to.eql('SET VARIABLE test "test test test"\n');
    });
  });

  describe('setAutoHangup', function() {
    it('sends correct command', function() {
      this.context.setAutoHangup(10);
      expect(this.context.sent.join('')).to.eql('SET AUTOHANGUP 10\n');
    });
  });

  describe('setCallerID', function() {
    it('sends correct command', function() {
      this.context.setCallerID('246');
      expect(this.context.sent.join('')).to.eql('SET CALLERID 246\n');
    });
  });

  describe('setContext', function() {
    it('sends correct command', function() {
      this.context.setContext('outbound');
      expect(this.context.sent.join('')).to.eql('SET CONTEXT outbound\n');
    });
  });

  describe('setExtension', function() {
    it('sends correct command', function() {
      this.context.setExtension('245');
      expect(this.context.sent.join('')).to.eql('SET EXTENSION 245\n');
    });
  });

  describe('setPriority', function() {
    it('sends correct command', function() {
      this.context.setPriority('2');
      expect(this.context.sent.join('')).to.eql('SET PRIORITY 2\n');
    });
  });

  describe('setMusic', function() {
    it('sends correct command', function() {
      this.context.setMusic('default');
      expect(this.context.sent.join('')).to.eql('SET MUSIC default\n');
    });
  });

  describe('channelStatus', function() {
    it('sends correct command', function() {
      this.context.channelStatus('test');
      expect(this.context.sent.join('')).to.eql('CHANNEL STATUS test\n');
    });
  });

  describe('getFullVariable', function() {
    it('sends correct command', function() {
      this.context.getFullVariable('test', 'test');
      expect(this.context.sent.join('')).to.eql('GET FULL VARIABLE test test\n');
    });
  });

  describe('getData', function() {
    it('sends correct command', function() {
      this.context.getData('test', 10, 5);
      expect(this.context.sent.join('')).to.eql('GET DATA test 10 5\n');
    });
  });

  describe('getOption', function() {
    it('sends correct command', function() {
      this.context.getOption('test', '#', 5);
      expect(this.context.sent.join('')).to.eql('GET OPTION test "#" 5\n');
    });
  });

  describe('getVariable', function() {
    it('sends correct command', function() {
      this.context.getVariable('test');
      expect(this.context.sent.join('')).to.eql('GET VARIABLE test\n');
    });    
  });

  describe('receiveChar', function() {
    it('sends correct command', function() {
      this.context.receiveChar(5);
      expect(this.context.sent.join('')).to.eql('RECEIVE CHAR 5\n');
    });
  });

  describe('receiveText', function() {
    it('sends correct command', function() {
      this.context.receiveText(5);
      expect(this.context.sent.join('')).to.eql('RECEIVE TEXT 5\n');
    });
  });

  describe('stream file', function() {
    it('sends', function () {
      this.context.streamFile('test', '1234567890#*', function() {});
      expect(this.context.sent.join('')).to.eql('STREAM FILE "test" "1234567890#*"\n');
    });    
  });

  describe('record file', function() {
    it('record', function () {
      this.context.recordFile('test', 'wav', '#', 10, 0, 1, 2, function() {});
      expect(this.context.sent.join('')).to.eql('RECORD FILE "test" wav # 10000 0 1 2\n');
    });    
  });

  describe('say number', function() {
    it('say number', function () {
      this.context.sayNumber('1234', '#', function() {});
      expect(this.context.sent.join('')).to.eql('SAY NUMBER 1234 "#"\n');
    });    
  });

  describe('say alpha', function() {
    it('say alpha', function () {
      this.context.sayAlpha('1234', '#', function() {});
      expect(this.context.sent.join('')).to.eql('SAY ALPHA 1234 "#"\n');
    });    
  });

  describe('say date', function() {
    it('say date', function () {
      this.context.sayDate('1234', '#', function() {});
      expect(this.context.sent.join('')).to.eql('SAY DATE 1234 "#"\n');
    });    
  });

  describe('say time', function() {
    it('say time', function () {
      this.context.sayTime('1234', '#', function() {});
      expect(this.context.sent.join('')).to.eql('SAY TIME 1234 "#"\n');
    });    
  });

  describe('say datetime', function() {
    it('say datetime', function () {
      this.context.sayDateTime('1234', '#', 'Y', 'DST',function() {});
      expect(this.context.sent.join('')).to.eql('SAY DATETIME 1234 "#" Y DST\n');
    });
  });

  describe('say phonetic', function() {
    it('say phonetic', function () {
      this.context.sayPhonetic('1234ABCD', '#', function() {});
      expect(this.context.sent.join('')).to.eql('SAY PHONETIC 1234ABCD "#"\n');
    });    
  });

  describe('context dial', function() {
    it('context dial', function() {
      this.context.dial('123', 10, 'A', function() {});
      expect(this.context.sent.join('')).to.eql('EXEC Dial 123,10,A\n');
    });    
  });

  describe('say digits', function() {
    it('say digits', function () {
      this.context.sayDigits('1234', '#', function() {});
      expect(this.context.sent.join('')).to.eql('SAY DIGITS 1234 "#"\n');
    });    
  });

  describe('send image', function() {
    it('send image', function () {
      this.context.sendImage('1234', function() {});
      expect(this.context.sent.join('')).to.eql('SEND IMAGE 1234\n');
    });    
  });

  describe('send text', function() {
    it('send text', function () {
      this.context.sendText('1234');
      expect(this.context.sent.join('')).to.eql('SEND TEXT "1234"\n');
    });    
  });

  describe('waitForDigit', function () {
    it('sends with default timeout', function() {
      this.context.waitForDigit(5000);
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

  describe('asyncAGIBreak', function() {
    it('sends "ASYNCAGI BREAK\\n"', function() {
      this.context.asyncAGIBreak();
      expect(this.context.sent.join('')).to.eql('ASYNCAGI BREAK\n');
    });
  });

  describe('answer', function() {
    it('sends "ANSWER\\n"', function() {
      this.context.answer();
      expect(this.context.sent.join('')).to.eql('ANSWER\n');
    });
  });

  describe('verbose', function() {
    it('sends correct command', function() {
      this.context.verbose('good', 2);
      expect(this.context.sent.join('')).to.eql('VERBOSE "good" 2\n');
    });
  });

  describe('tddMode', function() {
    it('sends correct command', function() {
      this.context.tddMode("on");
      expect(this.context.sent.join('')).to.eql('TDD MODE on\n');
    });
  });

  describe('noop', function() {
    it('sends correct command', function() {
      this.context.noop();
      expect(this.context.sent.join('')).to.eql('NOOP\n');
    });
  });

  describe('gosub', function() {
    it('sends correct command', function() {
      this.context.gosub('out','241','6','do');
      expect(this.context.sent.join('')).to.eql('GOSUB out 241 6 do\n');
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
    var server = (new agi()).start(3000);
    expect(server instanceof net.Server).ok();
  });

  it('invokes callback when a new connection is established', function(done) {
    var server = new agi(function(context) {
      expect(context instanceof Context);
      done();
    }).start(3000);

    server.emit('connection', new MemoryStream());
  });
});