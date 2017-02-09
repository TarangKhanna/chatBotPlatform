'use strict';

var apiai = require("apiai");

var app = apiai("d610ea89212f4c969fcb25f2dc7ab882");

var options = {
    sessionId: 'jbkqfbebf3'
};

var request = app.textRequest('Current price tesla', options);

request.on('response', function(response) {
    console.log(response);
});

request.on('error', function(error) {
    console.log(error);
});

request.end();
