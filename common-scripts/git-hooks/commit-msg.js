var fs = require('fs');
require('shelljs/global');

var fileName = process.argv[2];
var message = fs.readFileSync(fileName, "utf8").trim();

var regEx = new RegExp(/^\[\w.+\][ ]?\[(ALM|RMWB|COPI|TF|FOUN|RAC|CIBSE|COPIUI|CRA|DAPL|TBCM|LAN|TWO)-\d+\].*/);

if(!regEx.test(message)) {
  console.log("  Error: Commit message not in expected format")
  console.log("  ");
  console.log("  Format should be : \"[DevName] [PROJ-29183] Actual commit message\"");
  console.log("  Where PROJ can be ALM|RMWB|COPI|TF|FOUN|RAC|CIBSE|COPIUI|CRA|DAPL|TBCM|LAN|TWO");
  console.log("  Eg: \"[CK] [COPI-2314] case id textbox updated\".");
  process.exit(1);
}
