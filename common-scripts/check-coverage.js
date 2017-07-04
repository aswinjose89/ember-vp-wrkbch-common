var fs = require('fs');
require('shelljs/global');
require('./exec-command');

var expectedCoverage = 80;
var report = JSON.parse(fs.readFileSync('coverage.json', 'utf8'));
var actualCoverage = report.coverage.total.percentage;

console.log("Total test coverage : " + actualCoverage + "%");

if(actualCoverage < expectedCoverage) {
  console.log("Failure : Test coverage should be more than " + expectedCoverage + "%");
  exit(1);
}
