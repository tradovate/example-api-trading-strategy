const { waitForMs } = require("./waitForMs")

const waitUntil = async pred =>
new Promise(async res => {
    while(!pred()) {
        await waitForMs(100)
    }
    res()
})

module.exports = { waitUntil }