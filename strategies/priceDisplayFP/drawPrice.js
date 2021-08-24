const drawToConsole = require("../../utils/drawToConsole")

const drawPriceEffect = (state, action) => {
    const [event, payload] = action

    if(event === 'displayPrice/draw') {
        const { props } = payload
        const { contract } = props
        const { buffer } = state  

        drawToConsole({
            contract: contract.name,
            price: buffer.last().close
        })    
    }

    return action
}

module.exports = { drawPriceEffect }