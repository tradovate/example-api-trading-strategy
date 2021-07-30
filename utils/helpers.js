const fs = require('fs')

//if you don't use readline and call createInterface with the input and output streams, our input methods won't work...
const readline = require('readline')
const io = readline.createInterface({
    input: process.stdin,
    output: process.stdout
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
    return sumBy('close', data.slice(data.length - period))/period
}

const sum = data => data.reduce((a, b) => a + b, 0)

const sumBy = (prop, data) => data.reduce((a, b) => {
    let v = typeof b[prop] === 'function' 
        ? b[prop]()
        : b[prop]
    return a + v
}, 0)

const writeToLog = item => {
    let log = ''
    fs.readFile('./log.json', {}, (err, buffer) => {
        if(!err) {
            log += buffer.toString('utf-8') || ''
        }
        
        let newLog
        if(!log) {
            newLog = [].push(item)
        } else {
            let json = JSON.parse(log)
            newLog = json.push(item)
        }

        fs.writeFile('./log.json', JSON.stringify(newLog, null, 2), {}, () => { console.log('Logged new message from WebSocket.')})
    })

    
}

const KEYS = {
    ctrlC:  '03',
    enter:  '0d',
    up:     '1b5b41',
    down:   '1b5b42',
    right:  '1b5b43',
    left:   '1b5b44',
    shift:  '21e7'
}

module.exports = {
    KEYS,
    readline,
    io,
    calculateSma,
    readFile,
    sum, sumBy,
    writeToLog
}