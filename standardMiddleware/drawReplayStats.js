const calculatePnL = require("../utils/calculatePnL")
const drawToConsole = require("../utils/drawToConsole")
const { getReplaySocket, getSessionResults } = require("../websocket/utils")

const drawReplayStats = (state, action) => {
    const [event, {data, props}] = action

    if(event === 'replay/showStats') {
        const { position, product, buffer, realizedPnL } = state 
        const { finalPos, bought, sold, fillPairs } = data
        const { contract, dispatcher } = props

        drawToConsole(getSessionResults())

        dispatcher.dispatch('stop', {})
    }

    return action
}

module.exports = { drawReplayStats }