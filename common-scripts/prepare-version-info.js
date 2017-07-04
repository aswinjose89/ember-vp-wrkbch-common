require('shelljs/global');
require('./exec-command');

var fs = require('fs'), appDependencyList, appInfo = {compileTimeDependencies: {}}, appPackageJSON, k, getDependencyHash,
    appBowerJSON = JSON.parse(fs.readFileSync('bower.json')), uiFoundationAddons = {}, appPackageJSONSource = JSON.parse(fs.readFileSync('package.json'));

function renameDependenciesHashIntoChildrenArray(dependenciesHash) {
    var i, j, k;
    if (dependenciesHash.dependencies != null) {
        dependenciesHash._children = dependenciesHash.dependencies;
        for (k in dependenciesHash._children) {
            dependenciesHash._children[k].name = k;
        }
        delete dependenciesHash.dependencies;
        dependenciesHash._children = dependenciesHash._children;

        for (j in dependenciesHash._children) {
            if (dependenciesHash._children[j].dependencies != null) {
                renameDependenciesHashIntoChildrenArray(dependenciesHash._children[j]);
            }
        }
        dependenciesHash._children = convertObjectIntoArray(dependenciesHash._children);
    } else {
        for (i in dependenciesHash) {
            dependenciesHash[i].name = i;
            if (dependenciesHash[i].dependencies != null) {
                renameDependenciesHashIntoChildrenArray(dependenciesHash[i]);
            }
        }
    }
}

function prepareNpmDependencies(npmDependencyHash) {
    renameDependenciesHashIntoChildrenArray(npmDependencyHash);
    var i, dependencies = appPackageJSONSource.dependencies;
    for (i in npmDependencyHash) {
        if (i.indexOf('wb-ui-') !== -1) {
            if (dependencies[i] !== undefined) {
                uiFoundationAddons[i] = npmDependencyHash[i];
            }
            delete npmDependencyHash[i];
        }
    }
    return {
        name: 'NPM Dependencies',
        _children: convertObjectIntoArray(npmDependencyHash)
    };
}

function prepareBowerDependencies(dependencyHash) {
    var formattedDependencyHash = {}, k, formattedDependencyArray;
    for (k in dependencyHash) {
        formattedDependencyHash[k] = {
            name: k,
            version: dependencyHash[k]
        }
    }

    formattedDependencyArray = convertObjectIntoArray(formattedDependencyHash);

    return {
        name: 'Bower Dependencies',
        _children: formattedDependencyArray
    };
}

function convertObjectIntoArray(object) {
    return Object.keys(object).map(function (key) {
        return object[key];
    });
}

execCmd('npm ls --prod --json --loglevel silent > tmp/dependencies-hash.json', true);
appPackageJSON = JSON.parse(fs.readFileSync('tmp/dependencies-hash.json'));
fs.unlink('tmp/dependencies-hash.json');

appInfo.name = appPackageJSON.name;
appInfo.version = appPackageJSON.version;
appInfo.compileTimeDependencies = {name: 'Compile Time Dependencies', npmDependencies: appPackageJSON.dependencies};

appInfo.compileTimeDependencies.bowerDependencies = prepareBowerDependencies(appBowerJSON.dependencies);
appInfo.runTimeUIDependencies = {name: "UI Modules Dependency", _children: [{
    name: 'UI Runtime Modules',
    toBeLoaded: true,
    nodeType: 'uiModules'
}]};
appInfo.apiDependencies = {toBeLoaded: true, name: "Server Side Dependencies"};

for (k in appInfo.compileTimeDependencies.npmDependencies) {
    if (k.indexOf('wb-ui-') != -1) {
        appInfo.compileTimeDependencies.npmDependencies[k].version = appInfo.compileTimeDependencies.npmDependencies[k].resolved.split('#')[1] || 'master';
    }
}

appInfo.compileTimeDependencies.npmDependencies = prepareNpmDependencies(appInfo.compileTimeDependencies.npmDependencies);

appInfo.compileTimeDependencies._children = [appInfo.compileTimeDependencies.bowerDependencies, appInfo.compileTimeDependencies.npmDependencies];
delete appInfo.compileTimeDependencies.bowerDependencies;
delete appInfo.compileTimeDependencies.npmDependencies;

appInfo.runTimeUIDependencies._children.push({
    name: 'UI Foundation Addons',
    _children: convertObjectIntoArray(uiFoundationAddons)
});

appInfo._children = [appInfo.compileTimeDependencies, appInfo.runTimeUIDependencies, appInfo.apiDependencies];

delete appInfo.compileTimeDependencies;
delete appInfo.runTimeUIDependencies;
delete appInfo.apiDependencies;

fs.writeFileSync('app-version-info.json', JSON.stringify(appInfo));
console.log('Dependency version list generated and stored in dist/app-version-info.json');
