var gpio = require('rpi-gpio')
var gpiop = gpio.promise;

var stompService = require('./stompService')();

var destination = '/queue/zavlazovanie';
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