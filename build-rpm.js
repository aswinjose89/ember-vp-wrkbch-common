require('shelljs/global');
require('./common-scripts/exec-command');

var args = process.argv[2] ? process.argv[2] : '';
var currentEnv = getCurrentEnv();
execCmd('node common-scripts/set-build-version.js ' + args);

execCmd('node setup-project.js');
execCmd('ember build --prod');

execCmd('node common-scripts/rpm/setup-pom.js');
execCmd('mvn clean package -Denv=' + currentEnv);
