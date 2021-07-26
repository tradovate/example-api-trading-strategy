const { MarketDataSocket } = require("./MarketDataSocket");
const { ReplaySocket } = require("./ReplaySocket");
const { TradovateSocket } = require("./TradovateSocket");

const socket = new TradovateSocket()
const mdSocket = new MarketDataSocket()
const replaySocket = new ReplaySocket()

const connectSockets = () => Promise.all([
    socket.connect(process.env.WS_URL),
    mdSocket.connect(process.env.MD_URL),
    replaySocket.connect(process.env.REPLAY_URL)
])

const getSocket = () => socket

const getMdSocket = () => mdSocket

const getReplaySocket = () => replaySocket

module.exports = {
    connectSockets,
    getSocket,
    getMdSocket,
    getReplaySocket
}