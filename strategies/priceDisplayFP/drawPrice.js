const drawToConsole = require("../../utils/drawToConsole")

const drawPriceEffect = (state, action) => {
    const [event, payload] = action

    if(event === 'displayPrice/draw') {
        const { props } = payload
        const { contract } = props
        const { buffer } = state  

        console.log(buffer.buffer)

        drawToConsole({
            contract: contract.name,
            price: buffer.last()?.close || buffer.last()?.price
        })    
    }

    return action
}

module.exports = { drawPriceEffect }