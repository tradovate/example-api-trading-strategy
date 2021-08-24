const { DataBuffer, BarsTransformer } = require("../../utils/dataBuffer");
const { Strategy } = require("../strategy/strategy");
const { TdEvent } = require("../strategy/tdEvent");
const { drawPriceEffect } = require("./drawPrice");

class PriceDisplayStrategyFP extends Strategy {

    init(props) {
        this.addMiddleware(drawPriceEffect)
        return {
            buffer: new DataBuffer(BarsTransformer),
        }
    }

    next(prevState, [event, { data, props }]) {

        switch(event) {
            case TdEvent.Chart: {

                const { buffer } = prevState

                buffer.push(data)

                return {
                    state: prevState,
                    effects: [
                        {
                            event: 'displayPrice/draw'
                        }
                    ]
                }
            }

            default: {
                return { state: prevState }
            }
        }
    }

    static params = {
        ...super.params
    }
}

module.exports = { PriceDisplayStrategyFP }