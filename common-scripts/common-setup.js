var fs = require('fs');
var http = require('http');
require('shelljs/global');
require('./exec-command');

var shrinkwrapFile = 'tmp/deps/npm-shrinkwrap.json';
var offline = process.env.offline;
var currentEnv = getCurrentEnv();
console.log("Setup project : " + pwd());
console.log("=========================");
console.log("Current environment : " + currentEnv);
console.log("is Offline build? : " + (offline == 'true'));


var setup = function() {
  var shrinkwrapJson = JSON.parse(fs.readFileSync(shrinkwrapFile, 'utf8'));
  var moduleName = pwd().split('/').pop();
  delete shrinkwrapJson.dependencies[moduleName]
  fs.writeFileSync(shrinkwrapFile, JSON.stringify(shrinkwrapJson, undefined, 2));

  rm('-f', '.git/hooks/pre-commit', '.git/hooks/pre-push', '.git/hooks/commit-msg');
  rm('-f', 'npm-shrinkwrap.json');
  rm('-rf', 'node_modules/wb-ui-*');

  cp('-f', 'common-scripts/git-hooks/pre-commit', '.git/hooks/pre-commit');
  cp('-f', 'common-scripts/git-hooks/pre-push', '.git/hooks/pre-push');
  cp('-f', 'common-scripts/git-hooks/commit-msg', '.git/hooks/commit-msg');
  cp('-f', shrinkwrapFile, 'npm-shrinkwrap.json');

  execCmd('node common-scripts/setup-dependencies-json.js');

  if(offline) {
    console.log("*** Offline mode ***");
    execCmd('npm install --cache-min 9999999');
    execCmd('bower install --offline');
  }
  else {
    execCmd('npm install');
    execCmd('bower install');
  }

  rm('-f', 'npm-shrinkwrap.json');
}

var downloadShrinkwrap = function() {
  getLatestCommit(function (lastCommit) {
      download(repoBaseUrl() + '/npm-shrinkwrap.json?raw&at=' + lastCommit,
           'tmp/deps',
           'npm-shrinkwrap.json',
           setup);
  });
}

getLatestCommit(function (lastCommit) {
      download(repoBaseUrl() + '/' + currentEnv + '.json?raw&at=' + lastCommit,
         'tmp',
         currentEnv + '.json',
         downloadShrinkwrap);
  });
