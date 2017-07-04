var fs = require('fs');
var http = require('http');
require('shelljs/global');

var m2_repo = "c:/Users/1527380/.m2/to_upload";
var repo_id = "releases";
var nexus_host = "10.23.152.77";
var nexus_port = "8081";
var repo_url = "http://" + nexus_host + ":" + nexus_port + "/nexus/content/repositories/thirdparty";

var poms = find(m2_repo).filter(function(file) { return file.match(/\.pom$/); });
console.log("Found " + poms.length + " poms");

var fetchStatus = function(option, artifactPath, cmd, callback) {
  console.log("Fetching status");

  var req = http.request(option, function(r) {
    console.log("Processing response with http status : " + r.statusCode);
    processResponse(r, artifactPath, cmd, callback);
  }).end();
};

var processResponse = function(res, artifactPath, cmd, callback) {
  var status = res.statusCode;
  if(status === 200) {
	  console.log('Already present : ' + artifactPath);
  }
  else if(status === 404) {
	  console.log('Not present, uploading : ' + artifactPath);
	  var response = exec(cmd, {silent:true});

	  if(response.code != 0) {
      console.log("cmd failed : ");
		  console.log(cmd);
		  console.log("Output : ");
		  console.log(response.output);
	  }
    else {
		  console.log("Uploaded successfully");
	  }
  }
  else {
	  console.log('Http status : ' + status);
	  console.log('Error finding the status of artifact : ' + artifactPath);
  }

  console.log("-----------------------------------");
  callback();
};

var processPom = function(i, callback) {
  var path = poms[i].substring(m2_repo.length);
  console.log(i + ". processing path : " + path);

  if(path.indexOf("-SNAPSHOT") > -1 || path.indexOf('/com/scb/cic/') === 0) {
    console.log("Skipping pom : " + path);
    console.log("-----------------------------------");
    callback();
    return;
  }

  var lastIndex = path.lastIndexOf('/');
  var lastButOneIndex = path.substring(0, lastIndex).lastIndexOf('/');
  var lastButTwoIndex = path.substring(0, lastButOneIndex).lastIndexOf('/');

  var version =  path.substring(lastButOneIndex + 1, lastIndex);
  var group_path = path.substring(0, lastButTwoIndex);
  var group_id = group_path.split('/').join('.');
  var artifact_id = path.substring(lastButTwoIndex + 1, lastButOneIndex);
  var pom_path = poms[i];
  var jar_path = poms[i].replace(".pom",".jar");

  var cmd = "mvn deploy:deploy-file -DgroupId=" + group_id +
            " -DgeneratePom=false" +
            " -DartifactId=" + artifact_id +
            " -Dversion=" + version +
            " -DrepositoryId=" + repo_id +
            " -Durl=" + repo_url;

  if(fs.existsSync(jar_path)) {
    cmd = cmd +
          " -Dpackaging=jar" +
          " -DpomFile=" + pom_path +
          " -Dfile=" + jar_path;
  } else {
    cmd = cmd +
          " -Dfile=" + pom_path +
          " -Dpackaging=pom";
  }

  var artifactPath = '/nexus/service/local/repositories/thirdparty/content'
						+ group_path + '/'
						+ artifact_id + '/' + version + '/'
						+ artifact_id + '-' + version + '.pom';

  var auth = 'Basic ' + new Buffer('rmwbuser:rmwbuser').toString('base64');
  var httpHeaders = {
	                    'Content-Type': 'application/json',
                      'Authorization': auth
                    };
  var option = {
                  method: 'HEAD',
                	host: nexus_host,
                	port: nexus_port,
                	path: artifactPath,
                	headers: httpHeaders
                };

  fetchStatus(option, artifactPath, cmd, callback);
}

var i=0;
var processNextPom = function() {
  processPom(i, function() {
    i++;

    if(i < poms.length) {
      processNextPom();
    }
  });
}

processNextPom();
