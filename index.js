var gpio = require('rpi-gpio');
var express = require('express');

var app = express();
var gpiop = gpio.promise;

var stompService = require('./stompService')();

var dest = '/topic/zavlazovanie';
var stompMessageClient;

stompService.connect(function (sessionId, client) {
    console.log('connected ...');
    stompMessageClient = client;
    initPin(7, client, dest)
});

var err = function (err) {
    console.log('Error: ', err.toString())
};

var initPin = function (pin, client, destination) {
    gpiop.setup(pin, gpio.DIR_OUT).then(function () {
        console.log('pin ', pin, ' setup done.');
        client.subscribe(destination, function (body, headers) {
            console.log("get message ", body);
            return gpiop.write(pin, body);
        });
    }).catch(err);
};


/**
 * after crash process I close gpio
 */
process.on('SIGINT', function () {
    gpio.destroy(function () {
        console.log('All pins unexported');
    });
    stompMessageClient.disconnect();
});
process.on('uncaughtException', function (err) {
    logger.error('Caught exception: ', err);
});

//**************************************
//*********** REST API *****************
//**************************************

app.get('/', function (req, res) {
    res.send('Hello World')
});

const port = 3000;

app.listen(port);