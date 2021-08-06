const { drawReplayStats } = require("../../standardMiddleware/drawReplayStats")
const { nextReplayPeriod } = require("../../standardMiddleware/nextReplayPeriod")
const { placeOCO } = require("../../standardMiddleware/placeOCO")
const { placeOrder } = require("../../standardMiddleware/placeOrder")
const { productFind } = require("../../standardMiddleware/productFind")
const { replayComplete } = require("../../standardMiddleware/replayComplete")
const { startOrderStrategy } = require("../../standardMiddleware/startOrderStrategy")
const { dispatcher, pipeMiddleware } = require("../../utils/dispatcher")
const { getSocket, getMdSocket, getReplaySocket } = require("../../websocket/utils")

const TdEvent = {
    DOM:        'dom',
    UserSync:   'usersyncinit',
    Quote:      'quote',
    Chart:      'chart',
    Props:      'props',
    Histogram:  'histogram',
    Clock:      'clock'
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
        this._shouldRun = true

        const { barType, barInterval, contract, elementSizeUnit, timeRangeType, timeRangeValue, histogram, dev_mode, replay_periods } = props
        
        let self = this
        const model = { ...this.init(props), current_period: 0 }
        let mw = pipeMiddleware(
            startOrderStrategy, 
            placeOrder, 
            placeOCO, 
            productFind,
            nextReplayPeriod,
            replayComplete,
            drawReplayStats,
            ...this.mws
        )

        const D = dispatcher({ model, reducer: self.next.bind(self), mw })

        props.dispatcher = D

        const runSideFx = () => {
            let effects = D.effects()
            
            if(effects && effects.length && effects.length > 0) {
                console.log('effects: ')
                console.log(JSON.stringify(effects, null, 2))
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
                startTimestamp: replay_periods[0].start,
                callback: (item) => {
                    if(item.checkStatus && item.checkStatus === 'OK') {

                        disposerB = replaySocket.initializeClock({
                            startTimestamp: replay_periods[0].start,
                            callback: (item) => {
                                if(item) return

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

                                            this._setupEventCatcher(replaySocket, replaySocket)

                                            disposerA()
                                            disposerB()
                                            disposerC()
                                            // console.log(socket.ws.listeners())
                                        }
                                    }
                                })
                            }
                        })
                    } else throw new Error('Could not initialize replay session. Check that your replay periods are within a valid time frame.')
                }
            })
        } else {
            this._setupEventCatcher(socket, mdSocket)
        }

        this._setupEventCatcher = function _setupEventCatcher(socket, mdSocket) {

            // console.log(socket)
            // console.log(mdSocket)

            socket.synchronize(data => {
                if(data.users) {
                    if(!this._shouldRun) return
                    runSideFx()           
                    D.dispatch(TdEvent.UserSync, {
                        data,
                        props,
                    })         
                }
                else if(data.entityType) {
                    if(!this._shouldRun) return
                    runSideFx()
                    D.dispatch(TdEvent.Props, {
                        data,
                        props,
                    })
                }
            })

            socket.ws.addEventListener('message', msg => {
                if(msg.data.slice(1)) {
                    let data
                    try {
                        data = JSON.parse(msg.data.slice(1))
                    } catch(err) {
                        throw new Error(err)
                    }
                    data.forEach(item => {
                        if(item.e && item.e === 'clock') {
                            if(!this._shouldRun) return
                            runSideFx()
                            D.dispatch(TdEvent.Clock, { data: item.d, props })
                        }
                    })
                }
            })

            mdSocket.subscribeDOM({
                symbol: contract.name,
                contractId: contract.id,
                callback: data => {              
                    if(!this._shouldRun) return
                    runSideFx()
                    D.dispatch(TdEvent.DOM, {
                        data,
                        props,
                    })
                }
            })

            mdSocket.subscribeQuote({
                symbol: contract.name,
                contractId: contract.id,
                callback: data => {             
                    if(!this._shouldRun) return
                    runSideFx()
                    D.dispatch(TdEvent.Quote, {
                        data,
                        props,
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
                    if(!this._shouldRun) return
                    runSideFx()
                    D.dispatch(TdEvent.Chart, {
                        data,
                        props,
                    })
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

    catchReplaySessionsDefault(prevState, [event, { data, props }]) {

        if(event === 'stop') {
            console.log('[CALLED STOP]')
            // const socket = getReplaySocket()
            // const ws = socket.getSocket()
            // ws.close()
            // ws.removeAllListeners('message')
            this._shouldRun = false
            return
        }

        if(event === 'replay/resetEventHandlers') {
            const replaySocket = getReplaySocket()
            console.log(replaySocket)
            console.log('[CALLED RESET HANDLERS]')
            this._setupEventCatcher(replaySocket, replaySocket)
            return { state: prevState }
        }

        if(event === TdEvent.Clock) {

            console.log(data)

            const { current_period } = prevState
            const { replay_periods } = props
            const { t, s } = JSON.parse(data)
            

            const curStop = new Date(replay_periods[current_period]?.stop)?.toJSON()

            if(curStop && new Date(t).getTime() > new Date(curStop).getTime()) {
                console.log('[TRIED NEXT REPLAY]')
                return { 
                    state: { ...prevState, current_period: current_period+1 },
                    effects: [{ event: 'replay/nextReplayPeriod', data: { props } }]
                }   
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

module.exports = { Strategy, TdEvent, EntityType }