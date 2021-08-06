const { MarketDataSocket } = require("./MarketDataSocket");
const { TradovateSocket } = require("./TradovateSocket");

function ReplaySocket() {
    MarketDataSocket.call(this)
}

Object.assign(ReplaySocket.prototype, MarketDataSocket.prototype)

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
            // console.log('from RS line 27: '+JSON.stringify(item, null, 2))
            if(id === item.i && item.s === 200) {
                callback()
            }
            else if(item.e && item.e === 'clock') {
                callback(item.d)
            }
        },
    })
}

module.exports = { ReplaySocket }