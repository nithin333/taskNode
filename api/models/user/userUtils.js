  'use strict';
  var _ = require('lodash');
  var uuid = require('node-uuid');


  module.exports = (function() {
    function hasRole(roleToCheck, userRoles) {
      if (_.includes(userRoles, roleToCheck)) {
        return true;
      }
      return false;
    }

    function hasManageRole(userRoles) {
      return hasRole('Administrator', userRoles);
    }

    function userToken() {
      return uuid.v1();
    }

    return {
      hasRole: hasRole,
      hasManageRole: hasManageRole,
      userToken: userToken
    };

  })();