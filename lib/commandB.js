var commands = require('./command');

console.log(commands);

var q = {};

commands.map(function (command) { 
  q[command.name] = function () {
    var args = [].slice.call(arguments, 0, command.params);
    return command.command + " " + args.join(" ");
  };
});

console.log(q.databaseDel("1", "2", "3", "4"));
console.log(q.databaseDelTree("1", "2", "3", "4"));

console.log(commands.length)