const { RobotMode } = require("./robotMode")

const onChart = (prevState, {data, props}) => {

    const { mode, buffer, hlv, tlc, } = prevState
    const { contract, orderQuantity } = props
    
    buffer.push(data)        
    
    const { variance } = hlv(hlv.state, buffer.getData()).state
    const { negativeCrossover, positiveCrossover } = tlc(tlc.state, buffer.getData()).state

    const longBracket = {
        qty: orderQuantity,
        profitTarget: variance,
        stopLoss: -(Math.floor(variance/4)),
        trailingStop: true
    }
      
    const shortBracket = {
        qty: orderQuantity,
        profitTarget: -variance,
        stopLoss: (Math.ceil(variance/4)),
        trailingStop: true
    }

    const entryVersion = {
        orderQty: orderQuantity,
        orderType: 'Market',
    }
    
    if(mode === RobotMode.Watch && negativeCrossover) {
        return {
            state: {
                ...prevState,
                mode: RobotMode.Short,
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
                }
            ]
        }
    }

    if(mode === RobotMode.Watch && positiveCrossover) {
        return {
            state: {
                ...prevState,
                mode: RobotMode.Long,
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