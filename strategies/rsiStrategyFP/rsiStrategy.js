const highLowVariance                   = require("../../utils/highLowVariance");
const relativeStrengthIndex             = require('../../utils/rsi')

const { DataBuffer, BarsTransformer, TicksTransformer }   = require("../../utils/dataBuffer");
const { LongShortMode }                 = require("../common/longShortMode");
const { onProductFound }                = require("../common/onProductFound");
const { Strategy }                      = require("../strategy/strategy");
const { TdEvent }                       = require("../strategy/tdEvent");
const { drawEffect }                    = require("./drawEffect");
const { onChart }                       = require("./onChart");
const { onProps }                       = require("./onProps");
const { onUserSync }                    = require("./onUserSync");
const { onReplayComplete } = require("../common/onReplayComplete");


class RsiStrategy extends Strategy {
    constructor(props) {
        super(props)
    }

    init(props) {
        const { barType } = props
        this.addMiddleware(drawEffect)
        return {
            mode:           LongShortMode.Watch,
            strengthIndex:  relativeStrengthIndex(props.period),
            hlv:            highLowVariance(props.period),
            product:        null,
            position:       null,
            realizedPnL:    0,
            buffer:         new DataBuffer(barType === 'Bars' ? BarsTransformer : TicksTransformer)
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
                return onProductFound('rsi', prevState, payload)
            }

            case TdEvent.ReplayComplete: {
                return onReplayComplete(prevState, payload)
            }

            default: {
                return this.catchReplaySessionsDefault(prevState, [event, payload]) || { 
                    state: prevState,
                    effects: [
                        { event: 'rsi/draw' }          
                    ]
                }       
            }
        }
    }

    static params = {
        ...super.params,
        period:         'int',
        orderQuantity:  'int',
    }
}

module.exports = { RsiStrategy }