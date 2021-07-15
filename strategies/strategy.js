const { BarsTransformer, DataBuffer, TicksTransformer } = require("../utils/dataBuffer")
const { MarketDataSocket } = require("../websocket/MarketDataSocket")
const { TradovateSocket } = require("../websocket/TradovateSocket")

class Strategy {
    constructor(props) {

        let self = this

        this.socket = new TradovateSocket()
        this.mdSocket = new MarketDataSocket()

        this.initialized = false
        this.props = props
        this.tickCounter = 0

        const { barType, barInterval, contract, elementSizeUnit, histogram, timeRangeType, timeRangeValue } = this.props

    	Promise.all([							
            this.socket.connect(process.env.WS_URL), 
            this.mdSocket.connect(process.env.MD_URL)
        ])
        .then(() => {
            return this.socket.synchronize(data => {
                if(data.users) {
                    this.props.userData = data
                }
                else if(data.eventType === 'Updated') {
                    if(data.entityType === 'position'){
                        Object.assign(this.props.userData.positions.find(p => p.id === data.entity.id), data.entity)
                    }
                    else if(data.entityType === 'cashBalance') {
                        Object.assign(this.props.userData.cashBalances.find(cb => cb.id === data.entity.id), data.entity)
                    }
                }
            })
        })
        .then(syncSub => {				

            this.syncSubscription = syncSub

            this.initialized = true	
            this.buffer = new DataBuffer( 
                    barType === 'Tick'      ? TicksTransformer 
                :   barType === 'MinuteBar' ? BarsTransformer
                :                             null
            )


            console.log('Strategy initialized successfully.')

            this.dataSubscription = this.mdSocket.getChart({
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
                callback: (data) => self.state = self.tick.bind(self)(self.state, data) 
            }) 
        })        
    }

    getPosition() {
        if(!this.props.userData?.positions) return
        // console.log(this.props.userData.positions)

        const pos = this.props.userData.positions?.find(p => p.contractId === this.props.contract.id)

        if(!pos) return

        return pos
    }

    getOpenPnL(price) {
        const { contract } = this.props
        const pos = this.getPosition()

        // console.log(this.props.userData)
        if(!this.props.userData.products || !this.props.userData.positions) return 0

        const { products } = this.props.userData

        let item = products.find(p => p.name === contract.name.slice(0, 3))
                || products.find(p => p.name === contract.name.slice(0, 2))
                || products.find(p => p.name === contract.name.slice(0, 4))

        let vpp = item.valuePerPoint    

        
        let boughtPrice = pos.netPrice || pos.prevPrice || 0
        // console.log(`price: ${price} vpp: ${vpp}, bought@: ${boughtPrice}, item: ${JSON.stringify(item, null, 2)}, pos: ${JSON.stringify(pos, null, 2)}`)
        
        return (price - boughtPrice) * vpp * (pos.netPos || 0)       
    }

    turnOff() {
        this.dispose()
        process.exit(0)
    }


    tick(prevState, data) { 
        this.tickCounter++
        this.buffer.push(data)
    }

    dispose() {
        this.dataSubscription()
        this.syncSubscription()
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

module.exports = { Strategy }