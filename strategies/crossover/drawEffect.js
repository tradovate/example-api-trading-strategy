const calculatePnL = require("../../utils/calculatePnL")
const drawToConsole = require("../../utils/drawToConsole")

const drawEffect = (state, action) => {
    const [event, payload] = action

    if(event === 'crossover/draw') {
        const { props } = payload
        const { contract } = props
        const { product, position, mode, buffer, tlc, realizedPnL } = state
        const { distance } = tlc.state  

        drawToConsole({
            mode,
            contract: contract.name,      
            netPos: position?.netPos || 0,
            distance: distance.toFixed(2),
            'p&l': position && position.netPos !== 0 && product 
                ? `$${
                    calculatePnL({
                        price: buffer.last()?.price || buffer.last()?.close || 0, 
                        contract,
                        position,
                        product,
                    }).toFixed(2)
                }` 
                : '$0.00',
            realizedPnL: `$${realizedPnL.toFixed(2)}`
        }, false)    
    }

    return action
}

module.exports = { drawEffect }