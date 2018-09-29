var gpio = require('rpi-gpio');
var express = require('express');

var app = express();
var gpiop = gpio.promise;

var stompService = require('./stompService')();

const dest = '/topic/zavlazovanie';
const pinStudna = 7;
const resubscribeInterval = 120000;
const port = 3000;
var stompMessageClient;

stompService.connect(function (sessionId, client) {
    console.log('connected ...');
    stompMessageClient = client;
    initPin(pinStudna, client, dest)
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
    subscribe(stompMessageClient, dest, pinStudna);
};


var scheduler = function () {
    setTimeout(function () {
        resubscribe();
        scheduler();
    }, resubscribeInterval);
};

scheduler();


/**
 * after crash process I close gpio
 */
process.on('SIGINT', function () {
    gpio.destroy();
});
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});

//**************************************
//*********** REST API *****************
//**************************************

app.get('/health', function (req, res) {
    res.send('good')
});

app.listen(port);