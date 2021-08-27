const { Strategy } = require('../strategy/strategy')
const { TdEvent } = require('../strategy/tdEvent')

class YourCustomStrategy extends Strategy {
    constructor(params) {
        super(params)	
    }		

    init(props) {
        return {
            //your initial state here!
        }
    }

    next(state, [event, payload]) {
        switch(event) {
            case TdEvent.Chart: {
                console.log('got chart event')
                break
            }

            case TdEvent.DOM: {
                console.log('got DOM event')
                break
            }

            case TdEvent.Histogram: {
                console.log('got histogram event')
                break
            }

            case TdEvent.Quote: {
                console.log('got quote event')
                break
            }

            case TdEvent.UserSync: {
                console.log('got user sync event')
                break
            }

            case TdEvent.Props: {
                console.log('got props event')
                break
            }

            default: {
                return state
            }
        }
    }

    static params = {
        ...super.params,
    }

}

module.exports = { YourCustomStrategy }