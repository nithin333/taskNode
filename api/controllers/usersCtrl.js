/**
 * @fileOverview Controller file for the /users endpoint
 */
'use strict';

var usersModel = require('../models/user');
var httpResponseMessage = require('../utils/httpResponseMessage.js');

module.exports = (function() {
    var userModel = usersModel.userModel;
    return {
        /**
         * Add an user to the users collection
         * @param {HTTP Request}  request  HTTP Request object
         * @param {HTTP Response} response HTTP Response Object
         */
        addUser: function(request, response) {
            userModel.addUser(request.body, function(err, users) {
                return httpResponseMessage.postResponse(response, err, users);
            });
        },
        /**
         * Update an user in the users collection
         * @param {HTTP Request}  request  HTTP Request object
         * @param {HTTP Response} response HTTP Response Object
         */
        updateUser: function(request, response) {
            userModel.updateUser(request.body, function(err, updatedUser) {
                return httpResponseMessage.putResponse(response, err, updatedUser);
            });
        },
        /**
         * Remove an user from the users collection
         * @param {HTTP Request}  request  HTTP Request object
         * @param {HTTP Response} response HTTP Response Object
         */
        removeUser: function(request, response) {
            userModel.removeUser(request.params.email, function(err, removedUser) {
                if (err || removedUser === null) {
                    console.log('Could not find user');
                    return httpResponseMessage.matchNotFoundResponse(response);
                } else {
                    return httpResponseMessage.successfulRequestResponse(response);
                }
            });
        },
        /**
         * Get users from the users collection
         * @param {HTTP Request}  request  HTTP Request object
         * @param {HTTP Response} response HTTP Response Object
         */
        getUsers: function(request, response) {
            if (Object.keys(request.query).length !== 0) { //Get Paged users

                var searchText = '.*.*';
                var sort = request.query.sort;
                var sortBy = request.query.sortBy || 'email';
                var pageSize = request.query.pageSize;
                var pageNumber = request.query.pageNumber;
                var skipFrom = (pageNumber * pageSize) - pageSize;
                var fields = request.query.fields;
                var exportAsFile = request.query.exportAsFile;

                if (request.query.searchText !== 'undefined') {
                    searchText = '.*' + request.query.searchText + '.*';
                }

                userModel.getPagedUsers(sort, sortBy, pageSize, pageNumber, skipFrom, fields, searchText, function(err, pagedUsers, totalCount) {
                    var users = {};
                    if (pagedUsers && totalCount) {
                        users.users = pagedUsers;
                        users.count = totalCount;
                        users.pageNumber = pageNumber;
                        users.pageSize = pageSize;
                    }
                    if (exportAsFile) {
                        return httpResponseMessage.unimplementedActionResponse(response);
                    } else {
                        return httpResponseMessage.getResponse(response, err, users);
                    }
                });
            } else { //Get all users
                userModel.find(function(err, allUsers) {
                    //We don't send JSON arrays but JSON objects instead. 
                    var users = {};
                    if (allUsers) {
                        users = {
                            'users': allUsers
                        };
                    }
                    return httpResponseMessage.getResponse(response, err, users);
                });
            }
        },
        /**
         * Get user from the users collection
         * @param {HTTP Request}  request  HTTP Request object
         * @param {HTTP Response} response HTTP Response Object
         */
        getUser: function(request, response) {
            userModel.findOne({
                token: request.params.token
            }, function(err, user) {
                return httpResponseMessage.getResponse(response, err, user);
            });
        },
        /**
         * Authenticate an user, given their Email id
         * @param {HTTP Request}  request  HTTP Request object
         * @param {HTTP Response} response HTTP Response Object
         */
        authenticateUserByEmail: function(request, response) {
            var email = request.body.email;
            var refreshToken = true;
            var adminCheck = false;

            console.log('authenticaing user with email =' + email);
            if (email) {
                userModel.authenticateUser({
                        'email': email
                    },
                    refreshToken,
                    adminCheck,
                    function(err, user) {
                        if (err || user === null) {
                            console.log('error in authenticateUserByEmail=' + err);
                            return httpResponseMessage.unauthorizedRequestResponse(response);
                        } else {
                            console.log('----------------------- err = ' + err + ' & Found User =' + user);
                            return httpResponseMessage.successfulRequestResponse(response, user);
                        }
                    });
            } else {
                return httpResponseMessage.badRequestResponse(response);
            } //bad request
        },
        /**
         * Authenticate an user, given their token
         * @param {HTTP Request}  request  HTTP Request object
         * @param {HTTP Response} response HTTP Response Object
         */
        authenticateUserWithToken: function(request, response) {
            var token = request.body.token;
            var refreshToken = true;
            var adminCheck = false;

            if (token) {
                userModel.authenticateUser({
                        'token': token
                    },
                    refreshToken,
                    adminCheck,
                    function(err, user) {
                        if (err || user === null) {
                            console.log('error in authenticateUserWithToken =' + err);
                            return httpResponseMessage.unauthorizedRequestResponse(response);
                        } else {
                            console.log('----------------------- err = ' + err + ' & Found User =' + user);
                            return httpResponseMessage.successfulRequestResponse(response, user);
                        }
                    });
            } else {
                return httpResponseMessage.badRequestResponse(response);
            } //bad request

        }
    };
}());