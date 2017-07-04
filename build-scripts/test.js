require('shelljs/global');
require('../common-scripts/exec-command');

execCmd('node setup-project.js');
execCmd('ember test');
execCmd('node common-scripts/check-coverage.js');
