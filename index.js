var gpio = require('rpi-gpio')
var gpiop = gpio.promise;

var stompService = require('./stompService')();

var destination = '/topic/take-photo';
var stompMessageClient;

stompService.connect(function (sessionId, client) {
    stompMessageClient = client;
    client.subscribe(destination, function (body, headers) {
        console.log("get message ", body);
    });
});

gpiop.setup(7, gpio.DIR_OUT)
    .then(function () {
        return gpiop.write(7, true)
    }).catch(function (err) {
    console.log('Error: ', err.toString())
});