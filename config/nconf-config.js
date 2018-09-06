/*

TODO: 

It's not optimal that values set in this file can be changed outside this file. We should ideally have the ability to set constants that cannot be changed by any module. 
THis also has a potential security risk since a third party module (or spawned process) can change the nconf (or process.env) values. 
We will eventually want to migrate to using Object.defineProperty with the writable property set to false for globally accessible values. 

*/
'use strict';

var nconf = require('nconf');
var path = require('path');
var os = require('os');

module.exports = (function() {
  return {
    configure: function() {


      //Set default nconf settings.
      nconf.defaults({
        'serverPort': 5000,
        'env': 'development', 
        'serverTmpDirectory': os.tmpdir() 
      });

 
      nconf.env();


      nconf.argv();


      var filePath = nconf.get('configFilePath');
 
      if (!filePath) {
        filePath = path.join(__dirname, 'local.json');
      }
      nconf.file({
        file: filePath
      });
    }
  };
})();