require('shelljs/global');
require('./exec-command');
var fs = require('fs');

execCmd('git checkout -- package.json bower.json build-config.json');

var getBuildNumber = function() {
  var buildNumber = process.argv[2];
  buildNumber = buildNumber ? buildNumber :
                (process.env.BUILD_NUMBER ? process.env.BUILD_NUMBER : undefined);

  if(buildNumber === undefined) throw ('Please provide the build number');
  return buildNumber;
}

var updatePackageJson = function(buildNumber) {
  var packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  packageJson.version = buildNumber;

  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

  return packageJson.version;
}

var updateBuildConfig = function(version) {
  var configJson = JSON.parse(fs.readFileSync("build-config.json", "utf8"));
  configJson.production.fingerprint.customHash = version;

  fs.writeFileSync("build-config.json", JSON.stringify(configJson, null, 2));
}

var buildNumber = getBuildNumber();
var version = updatePackageJson(buildNumber);
updateBuildConfig(version);
