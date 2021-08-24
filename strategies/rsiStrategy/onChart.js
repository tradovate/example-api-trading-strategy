const { CrossoverMode } = require("../common/crossoverMode")

const onChart = (prevState, {data, props}) => {

    const { mode, buffer, hlv, strengthIndex, } = prevState
    const { contract, orderQuantity } = props
    
    buffer.push(data)        
    const buffData = buffer.getData()

    const lastHlv = hlv.state
    const lastRsi = strengthIndex.state
    const { variance } = hlv(lastHlv, buffData).state
    const { overbought, oversold } = strengthIndex(lastRsi, buffData).state

    const round_s = num => Math.round((num + Number.EPSILON) * 100) / 100

    const longBracket = {
        qty: orderQuantity,
        profitTarget: round_s(variance/1.33),
        stopLoss: round_s(-variance/5),
        trailingStop: true
    }
      
    const shortBracket = {
        qty: orderQuantity,
        profitTarget: round_s(-variance/1.33),
        stopLoss: round_s(variance/5),
        trailingStop: true
    }

    const entryVersion = {
        orderQty: orderQuantity,
        orderType: 'Market',
    }
    
    if(mode === CrossoverMode.Watch && overbought) {
        return {
            state: {
                ...prevState,
                mode: CrossoverMode.Short,
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

    if(mode === CrossoverMode.Watch && oversold) {
        return {
            state: {
                ...prevState,
                mode: CrossoverMode.Long,
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

    return { 
        state: prevState,
        effects: [{ event: 'rsi/draw' }]
    }
}

module.exports = { onChart }