const { TradovateSocket } = require("./TradovateSocket");

function ReplaySocket() {
    TradovateSocket.call(this)
}

ReplaySocket.prototype.initializeClock = function()