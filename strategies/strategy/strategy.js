const { placeOCO } = require("../../standardMiddleware/placeOCO")
const { placeOrder } = require("../../standardMiddleware/placeOrder")
const { startOrderStrategy } = require("../../standardMiddleware/startOrderStrategy")
const { dispatcher, pipeMiddleware } = require("../../utils/dispatcher")
const { getSocket, getMdSocket, getReplaySocket } = require("../../websocket/utils")

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
        let socket = getSocket()
        let mdSocket = getMdSocket()
        let replaySocket = getReplaySocket()

        const { barType, barInterval, contract, elementSizeUnit, timeRangeType, timeRangeValue, histogram, dev_mode, replay_periods } = props

        
        let self = this
        const model = this.init(props)
        let mw = pipeMiddleware(startOrderStrategy, placeOrder, placeOCO, ...this.mws)
        const D = dispatcher({model, reducer: self.next.bind(self), mw })

        const runSideFx = () => {
            let effects = D.effects()
            
            if(effects) {
                console.log('effects: ')
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
            let disposerA, disposerB
            disposerA = replaySocket.checkReplaySession({
                startTimestamp: replay_periods[0],
                callback: (item) => {
                    if(item.checkStatus && item.checkStatus === 'OK') {

                        disposerB = replaySocket.initializeClock({
                            startTimestamp: replay_periods[0],
                            callback: () => {
                                
                                const disposerC = replaySocket.request({
                                    url: 'account/list',
                                    callback: (id, item) => {
                                        if(id === item.i) {
                                            const accounts = item.d
                                            const account = accounts.find(acct => acct.active)
                                            console.log(account)
                                            
                                            process.env.ACCOUNT = JSON.stringify(account)
                                            process.env.ID = account.id,
                                            process.env.SPEC = account.name
                                            process.env.USER_ID = account.userId

                                            setupEventCatcher(replaySocket, replaySocket)

                                            disposerA()
                                            disposerB()
                                            disposerC()
                                            console.log(socket.ws.listeners)
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            })
        } else {
            setupEventCatcher(socket, mdSocket)
        }

        function setupEventCatcher(socket, mdSocket) {
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
    }

    init(props) { }

    addMiddleware(...mws) {
        this.mws = this.mws || []
        mws.forEach(mw => this.mws.push(mw))
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