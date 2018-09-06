'use strict';

/*
TODO: Add additional descriptor messages in debug mode. 
 */

/*
Offial Reference URL -> http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 */

module.exports = (function() {
    return {
        postResponse: function(response, err, data) {
            if (!err) {
                response.status(201).json(data);
            } else {
                console.log(err);
                response.status(err).send(data);
            }
        },
        putResponse: function(response, err, data) {
            if (!err) {
                response.status(200).json(data);
            } else {
                console.log(err);
                response.status(err).send(data);
            }
        },
        getResponse: function(response, err, data) {
        console.log('data = ' + data)
            if (!err) {
                if (data === null) {
                    return response.status(404);
                } else {

                    return response.status(200).json(data);
                }
            } else {
                console.log(err);

                return response.status(404);
            }
        },
        unimplementedActionResponse: function(response) {
            return response.status(405).end();
        },
        matchNotFoundResponse: function(response) {
            return response.status(404).end();
        },
        successNoContentResponse: function(response) {
            return response.status(204).end();
        },
        unauthorizedRequestResponse: function(response) {
            return response.status(401).end();
        },
        badRequestResponse: function(response) {
            return response.status(400).end();
        },
        successfulRequestResponse: function(response, data) {
            if (data) {
                return response.status(200).json(data);
            } else {
                return response.status(200).end();
            }
        },
        notImplementedResponse: function(response) {
            return response.status(501).end();
        },
        responseMessage: function(response, err, data) {
            return response.status(err).json(data);
        }
    };
}());