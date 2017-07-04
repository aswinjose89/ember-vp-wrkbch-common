require('shelljs/global');
require('./common-scripts/exec-command');

execCmd('node common-scripts/common-setup.js');

execCmd('ember install node_modules/wb-ui-core');
execCmd('ember install node_modules/wb-ui-base-app');
execCmd('ember install node_modules/wb-ui-theme');
execCmd('ember install node_modules/wb-ui-components');
execCmd('ember install node_modules/wb-ui-formservices');
