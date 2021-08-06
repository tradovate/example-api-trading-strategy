const highLowVariance = require("../../modules/highLowVariance")
const twoLineCrossover = require("../../modules/twoLineCrossover")

const { DataBuffer, BarsTransformer } = require("../../utils/dataBuffer")
const { Strategy, TdEvent } = require("../strategy/strategy")
const { onUserSync } = require("./onUserSync")
const { onProps } = require("./onProps")
const { onChart } = require("./onChart")
const { CrossoverMode } = require("./crossoverMode")
const { drawEffect } = require("./drawEffect")
const { onProductFound } = require("./onProductFound")
const { onReplayComplete } = require("./onReplayComplete")



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
            mode:       CrossoverMode.Watch,
            buffer:     new DataBuffer(BarsTransformer),
            tlc:        twoLineCrossover(props.shortPeriod, props.longPeriod),
            hlv:        highLowVariance(props.variancePeriod),
            product:    null,
            position:   null,
            realizedPnL: 0
        }
    }
    
    next(prevState, [event, payload]) {

        console.log('[NEXT]')
        console.log(JSON.stringify(prevState, null, 2))

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

            case 'product/found': {
                return onProductFound(prevState, payload)
            }

            case 'replay/showStats': {
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