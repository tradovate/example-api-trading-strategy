const fs = require('fs')

//if you don't use readline and call createInterface with the input and output streams, our input methods won't work...
const readline = require('readline')
const io = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const waitForMs = ms => {
    if(ms > 1000) console.log(`Waiting for ${ms/1000}s`)
    return new Promise(res => {
        setTimeout(() => res(), ms)
    })
}

const waitUntil = async pred =>
    new Promise(async res => {
        while(!pred()) {
            await waitForMs(100)
        }
        res()
    })

async function readFile(filePath) {
    try {
        const data = await fs.readFile(filePath);
        console.log(data.toString());
    } catch (error) {
        console.error(`Got an error trying to read the file: ${error.message}`);
    }
}

const calculateSma = (period, data) => {
    let s = sumBy('price', data.slice(data.length - period))
    return s/period
}

const sum = data => data.reduce((a, b) => a + b, 0)

const sumBy = (prop, data) => data.reduce((a, b) => {
    let v = typeof b[prop] === 'function' 
        ? b[prop]()
        : b[prop]
    return a + v
}, 0)



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
    calculateSma,
    readFile,
    sum, sumBy
}