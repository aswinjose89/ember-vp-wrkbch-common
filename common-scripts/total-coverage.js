var fs = require('fs');
var http = require('http');
require('shelljs/global');
require('./exec-command');

var auth = 'Basic ' + new Buffer('readonly:readonly').toString('base64');

var modules = [
    'WB-UI-Base-App',
    'WB-UI-Core',
    'WB-UI-Components',
    'WB-UI-FormServices',
    'WB-UI-Clients',
    'WB-UI-CallReports',
    'WorkBench',
    'ECDD-Plus'
];

var headers = {
    'Content-Type': 'application/json',
    'Authorization': auth
};

console.log("Total test coverage : ");
function getLastSuccessBuild(moduleName, buildNumber) {

    if (buildNumber === 0) {
        console.log('Cannot find successful build');
    }

    var options = {
        hostname: '192.168.3.8',
        port: 8153,
        path: '/go/files/' + moduleName + '/' + buildNumber + '/Build/1/build/coverage.json',
        method: 'GET',
        headers: headers
    };

    var req = http.get(options, function (response) {

        if (response.statusCode === 200) {

            var output = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                output += chunk;
            });
            response.on('end', function () {
                var obj = JSON.parse(output);
                var actualCoverage = obj.coverage.total.percentage;
                console.log('-----------------------------------------');
                console.log(" "+moduleName + " (Build-" + buildNumber + ")" + " : " + actualCoverage + "%");
                console.log('-----------------------------------------');
            });
        } else {
            //Try for the next build
            getLastSuccessBuild(moduleName, buildNumber - 1);
        }
        /* this is ok */
    }).end();
}

for (var i = 0; i < modules.length; i++) {

    var httpOptions = {
        hostname: '192.168.3.8',
        port: 8153,
        path: '/go/api/pipelines/' + modules[i] + '/history/0',
        method: 'GET',
        headers: headers
    };

    var buildNumber = '';
    var req = http.get(httpOptions, function (response) {

        var output = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            output += chunk;
        });

        response.on('end', function () {
            var obj = JSON.parse(output);
            buildNumber = obj.pipelines[0].label;
            moduleName = obj.pipelines[0].name;

            getLastSuccessBuild(moduleName, buildNumber);
        });
    }).end();
}
