  'use strict';
  var mongoose = require('mongoose');


  function deleteFieldIfEmpty(v) {
      if (v === null || v === '') {
          return undefined;
      }
      return v;
  }
  module.exports = (function() {

      var usersSchema = new mongoose.Schema({
          givenName: {
              type: String
          },
          lastName: {
              type: String
          },
          email: {
              type: String,
              lowercase: true
          },
          token: {
              type: String
          },
          userId: {
              type: String
          },
          password: {
              type: String
          }
      });

      return usersSchema;
  }());