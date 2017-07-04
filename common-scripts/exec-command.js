require('shelljs/global');
var http = require('http');
var fs = require('fs');
var latestCommitHash = {};


var execCmd = function(cmd, ignoreError) {
  console.log('--- Executing : ' + cmd );
  var output = exec(cmd);
  if(output.code != 0 && ignoreError !== true) {
    echo("Command `" + cmd + "` failed. Please check the logs.");
    exit(1);
  } else {
    return output;
  }
}

var sedFile = function(regex, value, fileName) {
  if(fs.existsSync(fileName)) {
    sed('-i', regex, value, fileName);
  }
}

var download = function(url, destDir, destFile, cb) {
  var filePath = destDir + '/' + destFile;
  mkdir('-p', destDir);
  rm('-f', filePath);

  var file = fs.createWriteStream(filePath);

  var options = {
     hostname: repoHost(),
     port: 7990,
     path: url,
     method: 'GET',
     headers: {
         'Content-Type': 'application/json',
     }
   }

  /*if(isScbEnv()) {
    var auth = 'Basic ' + new Buffer('wb-build:wb-build').toString('base64');
    options.headers.Authorization = auth;
  }*/

  console.log('Downloading ' + url + '...');

  var request = http.get(options, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
}

var repoHost = function() {
  var env = getCurrentEnv();
  if(env == 'scb') {
    return 'stash.uk.standardchartered.com';
  } else {
    return '192.168.3.5';
  }
}

var repoBaseUrl = function() {
  var env = getCurrentEnv();
  var host = repoHost();
  if(env == 'scb') {
    return 'http://' + host + ':7990/projects/WB2-FOUNDATION/repos/wb-tooling/browse';
  } else {
    return 'http://' + host + ':7990/projects/TOOLS/repos/wb-tooling/browse';
  }
}

var getLatestCommit = function (cb) {
  var env = getCurrentEnv(), restAPIUrl;
  var host = repoHost();
  var stashUserName, stashPassword, authHeader;
  var toolingBranch = JSON.parse(fs.readFileSync('./build-config.json')).toolingBranch || 'master';
  if (latestCommitHash[toolingBranch] == null) {
    if(env == 'scb') {
      restAPIUrl = 'http://' + host + ':7990/rest/api/1.0/projects/WB2-FOUNDATION/repos/wb-tooling/commits?until=' + toolingBranch;
    } else {
      restAPIUrl = 'http://' + host + ':7990/rest/api/1.0/projects/TOOLS/repos/wb-tooling/commits?until=' + toolingBranch;
    }

    console.log("Downloading " + restAPIUrl);
    download(restAPIUrl, 'tmp', 'latest-commits.json', function () {
      var latestCommit = JSON.parse(fs.readFileSync("tmp/latest-commits.json", "utf8")).values[0].id;
      console.log('loast commit for branch ' + toolingBranch + ' is ' + latestCommit);
      latestCommitHash[toolingBranch] = latestCommit;
      cb(latestCommit);
    });
  } else {
    console.log("Returning latestCommitHash from cache");
    cb(latestCommitHash[toolingBranch]);
  }
}

var isScbEnv = function() {
  return (getCurrentEnv() == 'scb');
}

var getConfig = function() {
  return require('../tmp/' + getCurrentEnv() + '.json');
}

var getCurrentEnv = function() {
  var env = process.env.env;
  return env ? env : 'optimum';
}

module.exports = repoBaseUrl;
global['repoBaseUrl'] = repoBaseUrl;

module.exports = getConfig;
global['getConfig'] = getConfig;

module.exports = execCmd;
global['execCmd'] = execCmd;

module.exports = download;
global['download'] = download;

module.exports = sedFile;
global['sedFile'] = sedFile;

module.exports = getCurrentEnv;
global['getCurrentEnv'] = getCurrentEnv;

module.exports = getLatestCommit;
global['getLatestCommit'] = getLatestCommit;
