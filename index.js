var gpio = require('rpi-gpio');
var express = require('express');

var app = express();
var gpiop = gpio.promise;

var stompService = require('./stompService')();

var destination = '/topic/zavlazovanie';
var stompMessageClient;

var err = function (err) {
    console.log('Error: ', err.toString())
};

var writeToPin = function (pin, value) {
    gpiop.setup(pin, gpio.DIR_OUT).then(function () {
        console.log('pin ', pin, ' setup done.');
        return gpiop.write(pin, value);
    }).catch(err);
};

stompService.connect(function (sessionId, client) {
    console.log('connected ...');
    stompMessageClient = client;
    stompMessageClient.subscribe(destination, function (body, headers) {
        console.log("get message ", body);
        writeToPin(7, body);
    });
});

//**************************************
//*********** REST API *****************
//**************************************

app.get('/', function (req, res) {
    res.send('Hello World')
});

const port = 3000;

app.listen(port);