var gpio = require('rpi-gpio')
var gpiop = gpio.promise;

gpiop.setup(7, gpio.DIR_OUT)
    .then(() => {
    return gpiop.write(7, true)
})
.catch((err) => {
    console.log('Error: ', err.toString())
})