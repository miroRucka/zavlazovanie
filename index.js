var gpio = require('rpi-gpio');
var express = require('express');

var app = express();
var gpiop = gpio.promise;

var stompService = require('./stompService')();

var destination = '/topic/zavlazovanie';
var stompMessageClient;

var connect = function () {
    stompService.connect(function (sessionId, client) {
        stompMessageClient = client;
        client.subscribe(destination, function (body, headers) {
            console.log("get message ", body);
            return gpiop.write(7, body);
        });
    });
};

gpiop.setup(7, gpio.DIR_OUT)
    .then(connect).catch(function (err) {
    console.log('Error: ', err.toString())
});

//**************************************
//*********** REST API *****************
//**************************************

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.listen(3000)