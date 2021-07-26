const { placeOCO } = require("../standardMiddleware/placeOCO")
const { placeOrder } = require("../standardMiddleware/placeOrder")
const { startOrderStrategy } = require("../standardMiddleware/startOrderStrategy")
const { dispatcher, pipeMiddleware } = require("../utils/dispatcher")
const { MarketDataSocket } = require("../websocket/MarketDataSocket")
const { ReplaySocket } = require("../websocket/ReplaySocket")
const { TradovateSocket } = require("../websocket/TradovateSocket")
const { getSocket, getMdSocket, connectSockets, getReplaySocket } = require("../websocket/utils")

const TdEvent = {
    DOM:        'dom',
    UserSync:   'usersyncinit',
    Quote:      'quote',
    Chart:      'chart',
    Props:      'props',
    Histogram:  'histogram'
}

const EntityType = {
    Position:           'position',
    CashBalance:        'cashBalance',
    Account:            'account',
    MarginSnapshot:     'marginSnapshot',
    Currency:           'currency',
    FillPair:           'fillPair',
    Order:              'order',
    Contract:           'contract',
    ContractMaturity:   'contractMaturity',
    Product:            'product',
    Exchange:           'exchange',
    Command:            'command',
    CommandReport:      'commandReport',
    ExecutionReport:    'executionReport',
    OrderVersion:       'orderVersion',
    Fill:               'fill', 
    OrderStrategy:      'orderStrategy',
    OrderStrategyLink:  'orderStrategyLink',
    ContractGroup:      'contractGroup'
}

class Strategy {
    constructor(props) {
        const socket = getSocket()
        const mdSocket = getMdSocket()
        const replaySocket = getReplaySocket()

        const { barType, barInterval, contract, elementSizeUnit, timeRangeType, timeRangeValue, histogram, dev_mode, replay_periods } = props

        let mw = pipeMiddleware(startOrderStrategy, placeOrder, placeOCO)

        let self = this
        const model = this.init(props)
        const D = dispatcher({model, reducer: self.next.bind(self), mw })

        const runSideFx = () => {
            let effects = D.effects()
            
            if(effects) {
                console.log(effects)
                effects.forEach(fx => {
                    if(fx.url) {
                        D.dispatch(fx.url, {data: fx.data, props})
                    }
                    else if(fx.event) {
                        D.dispatch(fx.event, {data: fx.data, props})
                    }
                })
                effects = []
            }
        }

        
        if(dev_mode) {
            // replaySocket.
        }
        socket.synchronize(data => {
            if(data.users) {
                D.dispatch(TdEvent.UserSync, {
                    data,
                    props,
                })                    
            }
            else if(data.entityType) {
                D.dispatch(TdEvent.Props, {
                    data,
                    props,
                })
            }
            runSideFx()
        })

        mdSocket.subscribeDOM({
            symbol: contract.name,
            contractId: contract.id,
            callback: data => {
                D.dispatch(TdEvent.DOM, {
                    data,
                    props,
                })
                runSideFx()
            }
        })

        mdSocket.subscribeQuote({
            symbol: contract.name,
            contractId: contract.id,
            callback: data => {
                D.dispatch(TdEvent.Quote, {
                    data,
                    props,
                })
                runSideFx()
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
                D.dispatch(TdEvent.Chart, {
                    data,
                    props,
                })
                runSideFx()
            }
        })
    }

    init(props) { }

    addMiddleware(...mws) {
        this.mws = mws
    }

    next(prevState, [event, {data, props}]) { }

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

module.exports = { Strategy, TdEvent, EntityType }