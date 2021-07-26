const calculatePnL = require("../../utils/calculatePnL")
const highLowVariance = require("../../modules/highLowVariance")
const twoLineCrossover = require("../../modules/twoLineCrossover")
const { DataBuffer, BarsTransformer } = require("../../utils/dataBuffer")
const drawToConsole = require("../../utils/drawToConsole")
const { Strategy, TdEvent, EntityType } = require("../strategy")
const { startOrderStrategy } = require("../../standardMiddleware/startOrderStrategy")
const { onUserSync } = require("./onUserSync")
const { onProps } = require("./onProps")
const { onChart } = require("./onChart")
const { placeOrder } = require("../../standardMiddleware/placeOrder")
const { RobotMode } = require("./robotMode")



/**
 * A Simple Strategy based on two Moving Averages and their interactions.
 */
class CrossoverStrategy extends Strategy {

    constructor(props) {
        super(props)        
    }

    init(props) {
        return {
            mode:       RobotMode.Watch,
            buffer:     new DataBuffer(BarsTransformer),
            tlc:        twoLineCrossover(props.shortPeriod, props.longPeriod),
            hlv:        highLowVariance(props.variancePeriod),
            product:    null,
            position:   null,
        }
    }
    
    next(prevState, [event, payload]) {
        const { props } = payload  
        const { contract } = props
        const { product, position, mode, buffer, tlc, } = prevState
        const { distance } = tlc.state

        drawToConsole({
            mode,
            contract: contract.name,      
            netPos: position?.netPos || 0,
            distance: distance.toFixed(2),
            'p&l': position && position.netPos !== 0 ? `$${calculatePnL({
                price: buffer.last()?.close || buffer.last()?.price || 0,
                contract,
                position,
                product,
            }).toFixed(2)}` : '$0.00'
        })    

        switch(event) {
            case TdEvent.Chart: {
                return onChart(prevState, payload)  
            }

            case TdEvent.Props: {
                return onProps(prevState, payload)
            }

            case TdEvent.UserSync: {
                return onUserSync(prevState, payload)
            }

            default: {
                return { state: prevState }
            }
        }
    }
    
    static params = {
        ...super.params,
        longPeriod:             'int',
        shortPeriod:            'int',
        variancePeriod:         'int',
        orderQuantity:          'int',
    }
}

module.exports = { CrossoverStrategy }