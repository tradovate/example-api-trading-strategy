const highLowVariance = require("../../utils/highLowVariance")
const twoLineCrossover = require("../../utils/twoLineCrossover")

const { DataBuffer, BarsTransformer } = require("../../utils/dataBuffer")
const { Strategy } = require("../strategy/strategy")
const { onUserSync } = require("./onUserSync")
const { onProps } = require("./onProps")
const { onChart } = require("./onChart")
const { LongShortMode } = require("../common/longShortMode")
const { drawEffect } = require("./crossoverDrawEffect")
const { onProductFound } = require("../common/onProductFound")
const { onReplayComplete } = require("./onReplayComplete")
const { TdEvent } = require("../strategy/tdEvent")



/**
 * A Simple Strategy based on two Moving Averages and their interactions.
 */
class CrossoverStrategy extends Strategy {

    constructor(props) {
        super(props)        
    }

    init(props) {
        this.addMiddleware(drawEffect)
        return {
            mode:       LongShortMode.Watch,
            buffer:     new DataBuffer(BarsTransformer),
            tlc:        twoLineCrossover(props.shortPeriod, props.longPeriod),
            hlv:        highLowVariance(props.variancePeriod),
            product:    null,
            position:   null,
            realizedPnL: 0
        }
    }
    
    next(prevState, [event, payload]) {

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

            case TdEvent.ProductFound: {
                return onProductFound('crossover', prevState, payload)
            }

            case TdEvent.ReplayComplete: {
                return onReplayComplete(prevState, payload)
            }

            default: {
                return this.catchReplaySessionsDefault(prevState, [event, payload]) || { 
                    state: prevState,
                    effects: [
                        { event: 'crossover/draw' }          
                    ]
                }       
            }
        }
    }
    
    static params = {
        ...super.params,
        longPeriod:     'int',
        shortPeriod:    'int',
        variancePeriod: 'int',
        orderQuantity:  'int',
    }
}

module.exports = { CrossoverStrategy }