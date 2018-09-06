'use strict';

var BearerStrategy = require('passport-http-bearer').Strategy;
var usersService = require('../api/models/user').userModel;
var passport = require('passport');

module.exports = function() {


    passport.use('bearer', new BearerStrategy({}, function(token, done) {

        process.nextTick(function() {
            var refreshToken = false;
            var adminCheck = false;
            usersService.authenticateUser({
                    'token': token
                },
                refreshToken,
                adminCheck,
                function(err, user) {
                    if (err) {
                        console.log('Error ' + err);
                        return done(err);
                    }
                    if (!user) {
                        console.log('User not found ');
                        return done(null, false);
                    }
                    console.log('Authenticated user as ' + user.email);
                    return done(null, user);
                });
        });
    }));


    passport.use('bearerPM', new BearerStrategy({}, function(token, done) {

        process.nextTick(function() {
            var refreshToken = false;
            var adminCheck = true; 
            usersService.authenticateUser({
                    'token': token
                },
                refreshToken,
                adminCheck,
                function(err, user) {
                    if (err) {
                        console.log('Error ' + err);
                        return done(err);
                    }
                    if (!user) {
                        console.log('User not found ');
                        return done(null, false);
                    }
                    console.log('Authenticated user as ' + user.email);
                    return done(null, user);
                });
        });
    }));


    passport.use('bearerDummy', new BearerStrategy({}, function(token, done) {

        process.nextTick(function() {
            var user = {
                email: 'mahesh.kumar@robosoftin.com'
            };
            return done(null, user);
        });
    }));
};