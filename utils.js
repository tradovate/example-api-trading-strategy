//if you don't use readline and call createInterface with the input and output streams, our input methods won't work...
const readline = require('readline')
const io = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const waitForMs = ms => 
    new Promise(res => {
        setTimeout(() => res(), ms)
    })

const waitUntil = async pred =>
    new Promise(async res => {
        while(!pred()) {
            await waitForMs(100)
        }
        res()
    })

const calculateSma = (period, data) => {
    let sum = data.slice(data.length - period)
        .reduce((a, b) => a + b.price, 0)

    return sum/period
}

const KEYS = {
    ctrlC:  '03',
    enter:  '0d',
    up:     '1b5b41',
    down:   '1b5b42',
    right:  '1b5b43',
    left:   '1b5b44',
}

module.exports = {
    waitForMs, 
    waitUntil,
    KEYS,
    readline,
    io,
    calculateSma
}