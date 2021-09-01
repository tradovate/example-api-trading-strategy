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

    const roundContract = (coeff, divisor) => {
        return +(Math.round((coeff*variance/divisor)/contract.providerTickSize) / (1/contract.providerTickSize))
    }

    const longBracket = {
        qty: orderQuantity,
        profitTarget: roundContract(1, 1.25),
        stopLoss: roundContract(-1, 5),
        trailingStop: true
    }
      
    const shortBracket = {
        qty: orderQuantity,
        profitTarget: roundContract(-1, 1.25),
        stopLoss: roundContract(1, 5),
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