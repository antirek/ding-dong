module.exports = [
    {
      name: "exec",
      command: "EXEC",
      params: 10
    },
    {
      name: "databaseDel",
      command: "DATABASE DEL",
      params: 2
    },
    {
      name: "databaseDelTree",
      command: "DATABASE DELTREE",
      params: 2
    },
    {
      name: "databaseGet",
      command: "DATABASE GET",
      params: 2
    },
    {
      name: "databasePut",
      command: "DATABASE PUT",
      params: 3
    },
    {
      name: "speechCreate",
      command: "SPEECH CREATE",
      params: 1
    },
    {
      name: "speechDestroy",
      command: "SPEECH DESTROY",
      params: 0
    },
    {
      name: "speechActivateGrammar",
      command: "SPEECH ACTIVATE GRAMMAR",
      params: 1
    },
    {
      name: "speechDeactivateGrammar",
      command: "SPEECH DEACTIVATE GRAMMAR",
      params: 1
    },
    {
      name: "speechLoadGrammar",
      command: "SPEECH LOAD GRAMMAR",
      params: 2
    },
    {
      name: "speechUnloadGrammar",
      command: "SPEECH UNLOAD GRAMMAR",
      params: 1
    },
    {
      name: "speechSet",
      command: "SPEECH SET",
      params: 2
    },
    {
      name: "speechRecognize",
      command: "SPEECH RECOGNIZE",
      params: 3
    },
    {
      name: "getVariable",
      command: "GET VARIABLE",
      params: 1
    },
    {
      name: "getFullVariable",
      command: "GET FULL VARIABLE",
      params: 2
    },
    {
      name: "getData",
      command: "GET DATA",
      params: 3
    },
    {
      name: "getOption",
      command: "GET OPTION",
      params: 3,
      paramRules: [
        null,
        {
          prepare: function (value) {
            return '"' + value + '"';
          }
        }
      ]
    },
    {
      name: "receiveChar",
      command: "RECEIVE CHAR",
      params: 1
    },
    {
      name: "receiveText",
      command: "RECEIVE TEXT",
      params: 1
    },
    {
      name: "setAutoHangup",
      command: "SET AUTOHANGUP",
      params: 1
    },
    {
      name: "setCallerID",
      command: "SET CALLERID",
      params: 1
    },
    {
      name: "setContext",
      command: "SET CONTEXT",
      params: 1
    },
    {
      name: "setExtension",
      command: "SET EXTENSION",
      params: 1
    },
    {
      name: "setPriority",
      command: "SET PRIORITY",
      params: 1
    },
    {
      name: "setMusic",
      command: "SET MUSIC",
      params: 1
    },
    {
      name: "setVariable",
      command: "SET VARIABLE",
      params: 2,
      paramRules: [
        null,
        {
          prepare: function (value) {
            return '"' + value + '"';
          }
        }
      ]
    },
    {
      name: "sendImage",
      command: "SEND IMAGE",
      params: 1
    },
    {
      name: "sendText",
      command: "SEND TEXT",
      params: 1,
      paramRules: [
        {
          prepare: function (value) {
            return '"' + value + '"';
          }
        }
      ]
    },
    {
      name: "channelStatus",
      command: "CHANNEL STATUS",
      params: 1
    },
    {
      name: "answer",
      command: "ANSWER",
      params: 0
    },
    {
      name: "verbose",
      command: "VERBOSE",
      params: 2,
      paramRules: [
        {
          prepare: function (value) {
            return '"' + value + '"';
          }
        }
      ]
    },
    {
      name: "tddMode",
      command: "TDD MODE",
      params: 1
    },
    {
      name: "noop",
      command: "NOOP",
      params: 0
    },
    {
      name: "gosub",
      command: "GOSUB",
      params: 4
    },
    {
      name: "recordFile",
      command: "RECORD FILE",
      params: 7,
      paramRules: [
        {
          default: "#",
          prepare: function (value) {
            return '"' + value + '"';
          }
        },
        null,
        null,
        {
          prepare: function (value) {
            return value * 1000;
          }
        }
      ]
    },
    {
      name: "sayNumber",
      command: "SAY NUMBER",
      params: 2,
      paramRules: [
        null,
        {
          default: "#",
          prepare: function (value) {
            return '"' + value + '"';
          }
        }
      ]
    },
    {
      name: "sayAlpha",
      command: "SAY ALPHA",
      params: 2,
      paramRules: [
        null,
        {
          default: "#",
          prepare: function (value) {
            return '"' + value + '"';
          }
        }
      ]
    },
    {
      name: "sayDate",
      command: "SAY DATE",
      params: 2,
      paramRules: [
        null,
        {
          default: "#",
          prepare: function (value) {
            return '"' + value + '"';
          }
        }
      ]
    },
    {
      name: "sayTime",
      command: "SAY TIME",
      params: 2,
      paramRules: [
        null,
        {
          default: "#",
          prepare: function (value) {
            return '"' + value + '"';
          }
        }
      ]
    },
    {
      name: "sayDateTime",
      command: "SAY DATETIME",
      params: 4,
      paramRules: [
        null,
        {
          prepare: function (value) {
            return '"' + value + '"';
          }
        }
      ]
    },
    {
      name: "sayDigits",
      command: "SAY DIGITS",
      params: 2,
      paramRules: [
        null,
        {
          prepare: function (value) {
            return '"' + value + '"'
          }
        }
      ]
    },
    {
      name: "sayPhonetic",
      command: "SAY PHONETIC",
      params: 2,
      paramRules: [
        null,
        {
          prepare: function (value) {
            return '"' + value + '"';
          }
        }
      ]
    },
    {
      name: "controlStreamFile",
      command: "CONTROL STREAM FILE",
      params: 7
    },
    {
      name: "streamFile",
      command: "STREAM FILE",
      params: 2,
      paramRules: [
        {
          prepare: function (value) {
            return '"' + value + '"';
          }
        },
        {
          default: '#',
          prepare: function (value) {
            return '"' + value + '"';
          }
        }
      ]
    },
    {
      name: "waitForDigit",
      command: "WAIT FOR DIGIT",
      params: 1
    },
    {
      name: "hangup",
      command: "HANGUP",
      params: 0
    },
    {
      name: "asyncAGIBreak",
      command: "ASYNCAGI BREAK",
      params: 0
    }
];