'use strict';

var cluster = require('cluster');
var nconf = require('nconf');

global.rootRequire = function(name) {
    return require(__dirname + '/api/' + name);
};

var clusterWorkerSize = require('os').cpus().length;

require('./config/nconf-config.js').configure();


if (cluster.isMaster) {
    for (var i = 0; i < clusterWorkerSize; i++) {
        cluster.fork();
    }


    cluster.on('exit', (deadWorker, code, signal) => {
 
        var worker = cluster.fork();

        var newPID = worker.process.pid;
        var oldPID = deadWorker.process.pid;
        // Log the event
        console.log('worker ' + oldPID + ' died.');
        console.log('worker ' + newPID + ' born.');
    });

    cluster.on('online', (worker) => {
        console.log('Worker ' + worker.id + ' started with pid: ' + worker.process.pid);
    });

    cluster.on('listening', (worker, address) => {
        console.log('Worker ' + worker.id + ' is now connected to ' + address.address + ':' + address.port);
    });
} else {

    var server = require('./config/server-config.js')();

    server.listen(nconf.get('serverPort'), function() {
        console.log('Server listening on port = ' + nconf.get('serverPort') + ' with environment = ' + nconf.get('env') + ' in worker ' + cluster.worker.id);
    });
}
