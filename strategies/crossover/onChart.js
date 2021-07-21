const { RobotMode } = require("./robotMode")

const onChart = (prevState, {data, props}) => {

    const { mode, buffer, hlv, tlc, } = prevState
    const { contract, orderQuantity } = props
    
    buffer.push(data)        
    
    const { variance } = hlv(hlv.state, buffer).state
    const { negativeCrossover, positiveCrossover } = tlc(tlc.state, buffer).state

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
    
    if(mode === RobotMode.Watch) {

        if(negativeCrossover) {            
            return {
                ...prevState,
                mode: RobotMode.Short,
                dispatch: {
                    url: '/order/startOrderStrategy',
                    data: {
                        contract,
                        action: 'Sell',
                        brackets: [shortBracket],
                        entryVersion,
                    }
                }
            }
        }
        else if(positiveCrossover) {
            return {
                ...prevState,
                mode: RobotMode.Long,
                dispatch: {
                    url: '/order/startOrderStrategy',
                    data: {
                        contract,
                        action: 'Buy',
                        brackets: [longBracket],
                        entryVersion
                    }
                }
            }
        }

        return prevState            
    }

    return prevState
}

module.exports = { onChart }