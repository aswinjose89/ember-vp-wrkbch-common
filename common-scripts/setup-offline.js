var fs = require('fs');
var http = require('http');
require('shelljs/global');
require('./exec-command');

var homeDir = process.env.HOME;
var offlineFilesDir = "/Users/ckarthik/scb/tooling/offline_build/"

var nodeModulesRoot = "/usr/local/lib/";
var localNpmRepoDir = "/home/hkrmwbrt/npm-repo/"
var targetDir = homeDir + "/tmp/offline/"
var npmDir = homeDir + "/.npm/"
var cacheDir = homeDir + "/.cache/"

var replaceModules = ["ember-cli"];
var updateModules = ["engine.io-client", "has-cors"];
var deleteModules = ["wb-ui-*"];

var toReplace = [
  [{
    key: '"xmlhttprequest":"https://github.com/rase-/node-XMLHttpRequest/archive/a6b6f2.tar.gz"',
    value: '"xmlhttprequest": "file://' + localNpmRepoDir + 'node-XMLHttpRequest.tar.gz"'
  }],
  [{
    key: '"global":"https://github.com/component/global/archive/v2.0.1.tar.gz"',
    value: '"global":"file://' + localNpmRepoDir + 'global-2.0.1.tar.gz"'
  }],
];

cd(npmDir);

console.log("======= DELETE MODULES ===========");
for (var i = 0; i < deleteModules.length; i++) {
  var moduleName = deleteModules[i];
  var targetModuleDir = npmDir + moduleName;
  console.log("Deleting module : " + targetModuleDir);
  rm('-rf', targetModuleDir);
}
console.log("");

console.log("====== REPLACE MODULES ============");
for (var i = 0; i < replaceModules.length; i++) {
  var moduleName = replaceModules[i];
  var tarToReplace = offlineFilesDir + moduleName + '.tar';
  console.log("Copying tar to replace " + tarToReplace);
  cp('-f', tarToReplace, npmDir);

  var targetModuleDir = npmDir + moduleName;
  console.log("Deleting " + targetModuleDir);
  rm('-rf', targetModuleDir);

  var tarFile = moduleName + '.tar';
  execCmd('tar -xvf ' + tarFile);
  rm('-r', tarFile)
}
console.log("");

console.log("======= UPDATE MODULES ===========");
for (var i = 0; i < updateModules.length; i++) {
  var sourceModule = updateModules[i];
  var keyValues = toReplace[i];
  console.log("Updating " + sourceModule);

  ls('-A', npmDir + sourceModule + '/*').forEach(function(file) {
    console.log("-- Processing version : " + file);
    var packageJson = file + '/package/package.json';
    cp('-f', packageJson, file + '/package/package.json_bak_' + new Date().toISOString());

    for (var i = 0; i < keyValues.length; i++) {
      var pair = keyValues[i];
      console.log("--- Replacing : " + pair.key + " with " + pair.value);
      sed('-i', pair.key , pair.value , packageJson);
    }
  });
}
console.log("");

var createTar = function(dir, source, target) {
  cd(dir);
  var tarFile = dir + '/' + target + '.tar';
  console.log('Tar directory : ' + source + ', output file : ' + tarFile);
  execCmd('tar -cf ' + target + '.tar ' + source);
  console.log('Copying tar to ' + targetDir);
  cp(tarFile, targetDir);
  rm('-f', tarFile);
  console.log("");
}

console.log("======= CREATING TARs ===========");
createTar(homeDir, '.npm', 'npm');
createTar(homeDir, '.node-gyp', 'node-gyp');
createTar(cacheDir, 'bower', 'bower');
createTar(nodeModulesRoot, 'node_modules', 'node_modules');
createTar(offlineFilesDir, 'npm-repo', 'npm-repo');

console.log("Tan Tana Tan");
