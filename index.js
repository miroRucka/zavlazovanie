var gpio = require('rpi-gpio');
var express = require('express');

var app = express();
var gpiop = gpio.promise;

var stompService = require('./stompService')();

var destination = '/topic/zavlazovanie';
var stompMessageClient;

stompService.connect(function (sessionId, client) {
    console.log('connected ...');
    stompMessageClient = client;
});

var err = function (err) {
    console.log('Error: ', err.toString())
};

gpiop.setup(7, gpio.DIR_OUT).then(function () {
    console.log('pin 7 setup done.');
    stompMessageClient.subscribe(destination, function (body, headers) {
        console.log("get message ", body);
        return gpiop.write(7, body);
    });
}).catch(err);

//**************************************
//*********** REST API *****************
//**************************************

app.get('/', function (req, res) {
    res.send('Hello World')
});

const port = 3000;

app.listen(port);