const calculatePnL = require("../utils/calculatePnL")
const drawToConsole = require("../utils/drawToConsole")
const { getReplaySocket } = require("../websocket/utils")

const drawReplayStats = (state, action) => {
    const [event, {data, props}] = action

    if(event === 'replay/drawStats') {
        const { position, product, buffer, realizedPnL } = state 
        const { finalPos, bought, sold, fillPairs } = data
        const { contract, dispatcher } = props

        let result = {

        }

        const theseFills = fillPairs?.filter(fp => fp.positionId === position.id) || []
        // const maxRunUp = theseFills.reduce((a, b) => Math.max(a.))


        drawToConsole({
            finalPos,
            totalBought: bought,
            totalSold: sold,
            openPnL: calculatePnL({
                price: buffer.last()?.price || buffer.last()?.close || 0, 
                contract,
                position,
                product,
            }).toFixed(2),
            realizedPnL,
            theseFills
        })

        dispatcher.dispatch('stop', {})
    }

    return action
}

module.exports = { drawReplayStats }