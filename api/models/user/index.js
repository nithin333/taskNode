'use strict';

var mongoose = require('mongoose');
var nconf = require('nconf');

var usersSchema = rootRequire('models/user/usersSchema.js');
var userUtils = rootRequire('models/user/userUtils.js');

module.exports = (function() {
    mongoose.createConnection(nconf.get('mongodbUri'));

    usersSchema.pre('save', function(next) {
        this.token = userUtils.userToken();
        this.userId = this._id;
        console.log(this);
        next();
    });


    usersSchema.options.toJSON = {
        transform: function(doc, ret, options) {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    };


    usersSchema.statics.getPagedUsers = function(sort, sortBy, pageSize, pageNumber, skipFrom, fields, searchText, callback) {
        var self = this;

        var sortString = {};
        sortString[sortBy] = sort;
        var query = '';

        if (fields) { 
            fields = fields.replace(/,/g, ' ');
            query = self.find({
                'givenName': {
                    $regex: searchText
                }
            }).skip(skipFrom).limit(pageSize).sort(sortString).select(fields);
        } else {
            query = self.find({
                'givenName': {
                    $regex: searchText
                }
            }).skip(skipFrom).limit(pageSize).sort(sortString);
        }

        self.count(function(err, totalCount) {
            query.exec(function(err, data) {
                callback(err, data, totalCount);
            });
        });

    };
    usersSchema.statics.addUser = function(userDetails, callback) {
        var self = this;
        self.findOne({
            'email': userDetails.email.toLowerCase()
        }, function(err, user) {
            if (err) {
                callback(500, null);
            } else {
                if (user === null) { 

                    if (userDetails.email) {
                        userDetails.email = userDetails.email.toLowerCase();
                    }
                    var userToAdd = new self(userDetails);
                    userToAdd.save(function(err, addedUser) {
                        console.log(err);
                        callback(null, addedUser.toJSON());
                    });
                } else {
                    callback(409, 'Conflict: The email already exists !'); //TODO: Return a proper status message letting the UI know that the user was not added.
                }
            }
        });
    };


    usersSchema.statics.updateUser = function(userData, callback) {
        if (userData && userData.email) {

            userData.email = userData.email.toLowerCase();

            var self = this;
            self.findOne({
                'email': userData.email.toLowerCase()
            }, function(err, user) {
                if (err) {
                    callback(500, null);
                } else {
                    if (user === null) { 
                        console.log('===========================The email of the user being updated is not in the system, we can proceed with the next check to see if we can PATCH the user being updated');
                        self.findOneAndUpdate({
                            token: userData.token
                        }, userData, function(err, documentViaFindOneAndUpdate) {
                            callback(null, documentViaFindOneAndUpdate);
                        });
                    } else { 
                        console.log('===========================The email of the user being updated is in the system. We will check if the user is the same one being updated, as specified by the token');
                        if (user.token === userData.token) {
                            console.log('===========================The email of the user being updated is matches the token. We can proceed');
                            user.update(userData, function(err, documentViaUpdate) {
                                callback(null, documentViaUpdate);
                            });
                        } else {
                            console.log('===========================The update operation cannot proceed. We do not allow emails to be duplicated, they have to be unique');
                            callback(409, 'Conflict: The email already exists !');
                        }
                    }

                }
            });
        } else {
            console.log('===========================Incomplete data to perform the operation');
            callback(-1, null);
        }
    };

    usersSchema.statics.removeUser = function(email, callback) {
        var self = this;
        self.findOneAndRemove({
            email: email.toLowerCase()
        }, function(err, updatedDocument) {
            callback(err, updatedDocument);
        });
    };


    usersSchema.statics.authenticateUser = function(authenticationCriteria, refreshToken, performAdminCheck, callback) {
        var self = this;
        var updatedUserDocument = {};
        var updateOptions = {}; 

        if (authenticationCriteria) {



            self.findOneAndUpdate(
                authenticationCriteria,
                updatedUserDocument,
                updateOptions,
                function(err, user) {

                    if (err || user === null) {
                        console.log('No user exists with the specified criteria or some error occured. Error value =' + err);
                        return callback(-1);
                    } else {
                        console.log('Found User =' + user);

                        if (performAdminCheck && performAdminCheck === true && !userUtils.hasManageRole(user.roles)) {
                            console.log('The user is not a PM User');
                            return callback(-1);
                        }
                        return callback(null, user); 
                    }
                });
        } else {
            console.log('Authentication criteria was not specified');
            return callback(-1);
        }
    };

    usersSchema.index({
        'email': 'text',
        'givenName': 'text'
    });



    return {
        userModel: mongoose.model('users', usersSchema)
    };


}());