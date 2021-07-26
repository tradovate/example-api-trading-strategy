const { TradovateSocket } = require("./TradovateSocket");

function ReplaySocket() {
    TradovateSocket.call(this)
}

Object.assign(ReplaySocket.prototype, TradovateSocket.prototype)

ReplaySocket.prototype.checkReplaySession = function({startTimestamp, callback}) {
    return this.request({
        url: 'replay/checkReplaySession',
        body: { startTimestamp },
        callback: (id, item) => {
            if(item.i === id) {
                callback(item.d)
            }
        }
    })
}

ReplaySocket.prototype.initializeClock = function({startTimestamp, speed = 400, initialBalance = 50000, callback}) {
    return this.request({
        url: 'replay/initializeClock',
        body: { startTimestamp, speed, initialBalance },
        callback: (id, item) => {
            console.log(item)
            if(id === item.i && item.s === 200) {
                // console.log()
            }
        },
    })
}

module.exports = { ReplaySocket }