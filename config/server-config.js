'use strict';

var nconf = require('nconf'),
    bodyParser = require('body-parser'),
 
    logger = require('./logger.js');

module.exports = function() {

    var app = require('express')();

    app.set('env', nconf.get('env'));

    require('mongoose').connect(nconf.get('mongodbUri'));

    app.use(function(request, response, next) {
        response.removeHeader('x-powered-by');
        next();
    });
    app.use(function (request, response, next) {
 
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
        response.header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With');
        next();
    });

 
    if (nconf.get('env') === 'development') {
 
        app.locals.pretty = true;
 
        app.use(require('morgan')('dev')); 
    }
 
    if (nconf.get('env') === 'production') {

        console.log = function() {};
    }

    app.use(require('compression')());
 
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json()); 

    app.use(require('response-time')());

    require('./passport-config.js')();

    require('../api/api-routes.js')(app);
 
    app.use(function errorHandler(err, request, response, next) {
 
        var errorMessage = '';

        if (nconf.get('env') === 'development') {
            errorMessage = 'Contact server admin with this error log' + err.stack;
        }

        response.status(500).send(errorMessage);


        if (err.domain) {
            try {

                var killtimer = setTimeout(function() {
                    process.exit(1);
                }, 30000);

                killtimer.unref();

            } catch (er2) {

                console.error('Error sending 500!', er2.stack);
            }
        }
        next();
    });

    return app;
};