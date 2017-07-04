require('shelljs/global');

var outputStr = exec('git diff --cached --name-only', {silent:true}).output.trim();
var modifiedFiles = outputStr.split(/\n/);

var importantFile = ['package.json','bower.json', 'build-config.json'];

var found = importantFile.some(function(s) {
  return modifiedFiles.indexOf(s) != -1;
});

if(found) {
  console.log("  Error: Please do not commit these files")
  console.log("  1) package.json");
  console.log("  2) bower.json");
  console.log("  3) build-config.json");
  console.log("  ");
  console.log("  Use the following command to fix this");
  console.log("  git reset HEAD package.json bower.json");
  process.exit(1);
}
