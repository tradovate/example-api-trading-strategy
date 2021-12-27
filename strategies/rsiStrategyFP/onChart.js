const { roundTicks } = require("../../utils/roundTicks")
const { LongShortMode } = require("../common/longShortMode")

const onChart = (prevState, {data, props}) => {

    const { mode, buffer, hlv, strengthIndex } = prevState
    const { contract, orderQuantity } = props
           
    buffer.push(data)
    const buffData = buffer.getData()

    const lastHlv = hlv.state
    const lastRsi = strengthIndex.state

    const { variance } = hlv(lastHlv, buffData)
    const { overbought, oversold } = strengthIndex(lastRsi, buffData)


    const longBracket = {
        qty: orderQuantity,
        profitTarget: roundTicks(1, 1.25, contract, variance),
        stopLoss: roundTicks(-1, 5, contract, variance),
        trailingStop: true
    }
      
    const shortBracket = {
        qty: orderQuantity,
        profitTarget: roundTicks(-1, 1.25, contract, variance),
        stopLoss: roundTicks(1, 5, contract, variance),
        trailingStop: true
    }

    const entryVersion = {
        orderQty: orderQuantity,
        orderType: 'Market',
    }
    
    if(mode === LongShortMode.Watch && overbought) {
        return {
            state: {
                ...prevState,
                mode: LongShortMode.Short,
                // buffer: buffer.concat(data)
            },
            effects: [
                {
                    url: 'orderStrategy/startOrderStrategy',
                    data: {
                        contract,
                        action: 'Sell',
                        brackets: [shortBracket],
                        entryVersion,
                    }
                },
                { event: 'rsi/draw' }
            ]
        }
    }

    if(mode === LongShortMode.Watch && oversold) {
        return {
            state: {
                ...prevState,
                mode: LongShortMode.Long,
                // buffer: buffer.concat(data)
            },
            effects: [
                {
                    url: 'orderStrategy/startOrderStrategy',
                    data: {
                        contract,
                        action: 'Buy',
                        brackets: [longBracket],
                        entryVersion
                    }
                },
                { event: 'rsi/draw' }
            ]
        }
    }

    return { state: prevState }
}

module.exports = { onChart }