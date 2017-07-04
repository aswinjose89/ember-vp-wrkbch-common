var fs = require('fs');
var http = require('http');
require('shelljs/global');
require('../exec-command');

var packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

rm('-f', 'pom.xml');
cp('-f', 'common-scripts/rpm/rpm-pom.xml', 'pom.xml');

var replace = function(key, value) {
  var regex = new RegExp(key, "g");
  sedFile(regex, value, 'pom.xml');
}

replace("\@\@package\.name_INJECT_PROPERTY", packageJson.name)
replace("\@\@package\.version_INJECT_PROPERTY", packageJson.version)

var preScript = fs.readFileSync("common-scripts/rpm/pre-install.sh", "utf8");
replace("\@\@pre-install\.sh_INJECT_SCRIPT", preScript)

var postScript = fs.readFileSync("common-scripts/rpm/post-install.sh", "utf8");
replace("\@\@post-install\.sh_INJECT_SCRIPT", postScript)

console.log("Pom file created for RPM generation");
