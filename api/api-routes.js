
'use strict';

var express = require('express');
var passport = require('passport');

var usersCtrl = rootRequire('controllers/usersCtrl.js');

module.exports = function(app) {
    var authenticateToken = passport.authenticate('bearer', {
        session: false
    });
    var authenticatePMToken = passport.authenticate('bearerPM', {
        session: false
    });


    var usersRouter = express.Router();
    usersRouter.post('/', usersCtrl.addUser);
    usersRouter.delete('/:email', usersCtrl.removeUser);
    usersRouter.patch('/',  usersCtrl.updateUser);
    usersRouter.get('/',  usersCtrl.getUsers);
    usersRouter.get('/:token',  usersCtrl.getUser);
    app.use('/api/users', usersRouter);

 
    app.post('/authenticateToken', usersCtrl.authenticateUserWithToken);
 
    app.post('/authenticateEmail', usersCtrl.authenticateUserByEmail);
};