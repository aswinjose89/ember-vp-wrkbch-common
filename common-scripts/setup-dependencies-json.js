var fs = require('fs');
var http = require('http');

require('shelljs/global');
require('./exec-command');

var setupDeps = function() {
  var lines = fs.readFileSync("tmp/deps/dependencies", "utf8");

  lines.split(/\n/).forEach(
    function (line) {
      if(line.trim().length == 0) return;

      var key = line.substring(0, line.indexOf(':')).trim();
      var value = line.substring(line.indexOf(':') + 1).trim();

      if(value.indexOf("$env{") == 0) {
        var envKey = value.substring(5, value.length - 1).trim();
        var config = getConfig();
        value = config[envKey];
      }

      key = "\@\@" + key + "_VERSION";
      var regex = new RegExp(key, "g");

      sedFile(regex, value, 'package.json');
      sedFile(regex, value, 'bower.json');
      sedFile(regex, value, 'npm-shrinkwrap.json');
    }
  );
}

var downloadDeps = function() {
  getLatestCommit(function (lastCommit) {
      download(repoBaseUrl() + '/dependencies?raw&at=' + lastCommit,
           'tmp/deps',
           'dependencies',
           setupDeps);
  });
}

console.log("Setup dependencies : " + pwd());
console.log("=========================");
var currentEnv = getCurrentEnv();
getLatestCommit(function (lastCommit) {
      download(repoBaseUrl() + '/' + currentEnv + '.json?raw&at=' + lastCommit,
        'tmp',
        currentEnv + '.json',
        downloadDeps);
  });
