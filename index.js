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

var subscribe = function (client, destination, pin) {
    client.subscribe(destination, function (body, headers) {
        console.log("get message ", body);
        return gpiop.write(pin, body);
    });
};

var unsubscribe = function (client, destination) {
    client.unsubscribe(destination);
};

var initPin = function (pin, client, destination) {
    gpiop.setup(pin, gpio.DIR_OUT).then(function () {
        console.log('pin ', pin, ' setup done.');
        subscribe(client, destination, pin);
    }).catch(err);
};

var resubscribe = function () {
    unsubscribe(stompMessageClient, dest);
    subscribe(stompMessageClient, dest, 7);
};


var scheduler = function () {
    setTimeout(function () {
        console.log('start repair script');
        resubscribe();
        scheduler();
    }, 3000);
};

scheduler();


/**
 * after crash process I close gpio
 */
process.on('SIGINT', function () {
    gpio.destroy();
    try {
        stompMessageClient.disconnect();
    } catch (e) {
        console.log('error', e);
    }
});
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});

//**************************************
//*********** REST API *****************
//**************************************

app.get('/', function (req, res) {
    res.send('Hello World')
});

const port = 3000;

app.listen(port);