/**
 * @fileOverview The logger configuration file. This specifies how logs will be written.
 *
 * @todo : Set logging transports based on the environment. It's more convinient to log to a file/console in development and the database in production.
 */

'use strict';

var winston = require('winston');
var nconf = require('nconf');

module.exports = (function() {

	require('winston-mongodb').MongoDB;


	winston.emitErrs = true;

	var logger = new winston.Logger({
		transports: [

			new winston.transports.Console({
				level: 'debug',
				// handleExceptions: true,
				json: false,
				colorize: true
			}),
			new winston.transports.MongoDB({
				db: nconf.get('logsDbUri')
			})

		],
		exitOnError: false 
	});

	/**
	 * Page the Winston log data. This is beneficial for retreiving the log data from the database and displaying in a client UI for administrative purposes.
	 * @param  {JSONObject}   	options  Winston query options.
	 *                                  Example
	 *                                  	var options = {
	 *                                    		from: new Date - 24 * 60 * 60 * 1000,
	 *   										until: new Date,
	 *   										limit: 10,
	 *   										start: 0,
	 *   										order: 'desc',
	 *  										fields: ['message']
	 * 										};
	 * @param  {Function} 		callback Callback function
	 *
	 * Reference: https://github.com/winstonjs/winston#querying-logs
	 */
	function pageLog(options, callback) {
		winston.query(options, function(err, results) {
			if (err) {
				return callback(-1, null)
			}

			return callback(null, results);
		});
	}

	return {
		logger: logger,
		pageLog: pageLog
	}
})();