const { makeSocketApi } = require("../endpoints/api")
const { BarsTransformer, DataBuffer, TicksTransformer } = require("../utils/dataBuffer")
const { MarketDataSocket } = require("../websocket/MarketDataSocket")
const { TradovateSocket } = require("../websocket/TradovateSocket")

const TdEvent = {
    DOM:        'dom',
    UserSync:   'usersyncinit',
    Quote:      'quote',
    Chart:      'chart',
    Props:      'props',
    Histogram:  'histogram'
}

class Strategy {
    constructor(props) {
        const socket = new TradovateSocket()
        const mdSocket = new MarketDataSocket()

        const api = makeSocketApi(socket)

        const { barType, barInterval, contract, elementSizeUnit, timeRangeType, timeRangeValue, histogram } = props

        let self = this
        let state = this.init(props)

        Promise.all([
            socket.connect(process.env.WS_URL),
            mdSocket.connect(process.env.MD_URL)
        ]).then(() => {

            socket.synchronize(data => {
                if(data.users) {
                    state = self.next(state, {
                        event: TdEvent.UserSync,
                        data,
                        props,
                        api
                    })
                }
                else if(data.entityType) {
                    state = self.next(state, {
                        event: TdEvent.Props,
                        data,
                        props,
                        api
                    })
                }
            })

            mdSocket.subscribeDOM({
                symbol: contract.name,
                contractId: contract.id,
                callback: data => {
                    state = self.next(state, {
                        event: TdEvent.DOM,
                        data,
                        props,
                        api
                    })
                }
            })

            mdSocket.subscribeQuote({
                symbol: contract.name,
                contractId: contract.id,
                callback: data => {
                    state = self.next(state, {
                        event: TdEvent.Quote,
                        data,
                        props,
                        api
                    })
                }
            })

            mdSocket.getChart({
                symbol: contract.name,
                chartDescription: {
                    underlyingType: barType,
                    elementSize: barType === 'Tick' ? 1 : barInterval,
                    elementSizeUnit,
                    withHistogram: histogram === 'true'
                },
                timeRange: {
                    [timeRangeType]: 
                        timeRangeType === 'asMuchAsElements' 
                        || timeRangeType === 'closestTickId' 
                            ? timeRangeValue 
                            : timeRangeValue.toString()
                },
                callback: data => {
                    state = self.next(state, {
                        event: TdEvent.Chart,
                        data,
                        props,
                        api
                    })
                }
            })

        })
    }

    init(props) {
        return { mode: 'Default Robot Mode' }
    }

    next(prevState, {event, data, props, api}) {
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
        }
    }

    static params = {
        contract: 'object',

        barType: {
            MinuteBar:  'MinuteBar',
            Tick:       'Tick',
            DOM:        'DOM',
            Daily:      'DailyBar'
        },

        barInterval: 'int',

        elementSizeUnit: {
            UnderlyingUnits:'UnderlyingUnits',
            Volume:         'Volume',
            Range:          'Range',
            Renko:          'Renko',
            MomentumRange:  'MomentumRange',
            PointAndFigure: 'PointAndFigure'
        },

        histogram: {
            Yes: true,
            No: false
        },

        timeRangeType: {
            asMuchAsElements: 'asMuchAsElements',
            asFarAsTimestamp: 'asFarAsTimestamp',
            closestTimestamp: 'closestTimestamp',
            closestTickId:    'closestTickId',
        },

        timeRangeValue: 'int',    
    }
}

module.exports = { Strategy, TdEvent }