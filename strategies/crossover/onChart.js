const { CrossoverMode } = require("./crossoverMode")

const onChart = (prevState, {data, props}) => {

    const { mode, buffer, hlv, tlc, } = prevState
    const { contract, orderQuantity } = props
    
    buffer.push(data)        
    
    const { variance } = hlv(hlv.state, buffer.getData()).state
    const { negativeCrossover, positiveCrossover } = tlc(tlc.state, buffer.getData()).state

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
    
    if(mode === CrossoverMode.Watch && negativeCrossover) {
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
                { event: '/draw' }
            ]
        }
    }

    if(mode === CrossoverMode.Watch && positiveCrossover) {
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
                }
            ]
        }
    }

    return { state: prevState }
}

module.exports = { onChart }