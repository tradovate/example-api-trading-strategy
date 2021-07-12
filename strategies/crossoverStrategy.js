const fs = require('fs')
const { pressEnterToContinue } = require("../modules/enterToContinue")
const { calculateSma, sortByDate } = require("../utils")
const { MarketDataSocket } = require("../websocket/MarketDataSocket")
const { Strategy } = require("./strategy")
const placeOrder = require('../endpoints/placeOrder')
const { TradovateSocket } = require("../websocket/TradovateSocket");
const { waitUntil } = require('../modules/waitUntil')
const startOrderStrategy = require('../endpoints/startOrderStrategy')



// // // // // // // // // // // // // // // //
// Instantiate WebSockets                    //
// // // // // // // // // // // // // // // //

/** Market Data Socket for gathering the real-time data */
const mdSocket = new MarketDataSocket()
/** Standard websocket for sync-ing user data */
const socket = new TradovateSocket()

// // // // // // // // // // // // // // // //
// Define RobotMode + RobotAction Enums      //
// // // // // // // // // // // // // // // //
const RobotMode = {
    Processing:  '[RobotMode] Processing',
    Watch:       '[RobotMode] Watch',
    AwaitResult: '[RobotMode] AwaitResult'
}

const RobotAction = {
    Buy:        'Buy',
    Sell:       'Sell',
    Wait:       'Wait'
}

// // // // // // // // // // // // // // // //
// CrossoverStrategy Class                   //
// // // // // // // // // // // // // // // //

/**
 * A Simple Strategy based on two Moving Averages and their interactions.
 */
class CrossoverStrategy extends Strategy {

    // // // // // // // // // // // // // // // //
    // CrossoverStrategy Constructor             //
    // // // // // // // // // // // // // // // //

    /** 
     * This is where we initialize the CrossoverStrategy class instance.
     * We wait for our websockets to be connected and the set this.initialized to true so that our main loop can carry on (it waits on Strategy.initialized)
     */
    constructor(params) {
        super(params)
        this.mode = RobotMode.Watch

        Promise.all([
            socket.connect(process.env.WS_URL), 
            mdSocket.connect(process.env.MD_URL)
        ])
        .then(() => socket.synchronize())
        .then(res => {
            //we want to have our user data pre-synchronized so we do it on init to get an initial snapshot       
            this.props.userData = res
            const { positions } = res
            const { contract } = this.props
            //this allows us to know things like our current net position
            //however they can also be null if you have no current positions
            //or no position with the contract in question.
            let pos = positions?.find(p => p.contractId === contract.id)
            this.props.position = pos?.netPos || 0 
            this.initialized = true
        })        
    }
    
    // // // // // // // // // // // // // // // //
    // The Strategy Loop                         //
    // // // // // // // // // // // // // // // //
    
    async run() {
        const { longPeriod, midPeriod, shortPeriod, barInterval, contract, orderQuantity, takeProfitThreshold, userData } = this.props
        const data = [] 

        // // // // // // // // // // // // // // // //
        // Draw To Console Section                   // 
        // // // // // // // // // // // // // // // //

        const drawWatchLoop = (price, shortSma, midSma, longSma) => {
            if(data.length > longPeriod) {
                return
            }

            const {products, fills, positions, cashBalances} = userData

            console.clear()    
            // console.log(this.props.userData)
            // console.log(JSON.stringify(data))

            let currentDiff = shortSma - longSma
            let pl
            if(products && products.length !== 0) {
                let pos = positions?.find(p => p.contractId === contract.id)

                this.props.position = pos?.netPos || 0

                if(pos) {
                    // if(this.lastOrder) {
                    //     lastPrice = fills.find(f => f.orderId === this.lastOrder.orderId)?.price || 0
                    // }
    
                    const symbol = contract.name
    
                    let item = 
                            products.find(p => p.name === symbol.slice(0, 3))   //contracts have variable
                        ||  products.find(p => p.name === symbol.slice(0, 2))   //name lengths...this exppression
                        ||  products.find(p => p.name === symbol.slice(0, 4))   //accounts for a few naming schemes
            
                    let vpp = item.valuePerPoint    
            
                    let buy = pos.netPrice ? pos.netPrice : pos.prevPrice
    
                    pl = (price - buy) * vpp * pos.netPos    
                    this.props.pl = pl              
                }
            }

            if(this.mode === RobotMode.Processing) {
                console.log(`[Tradobot]: Signal noted. Processing order...`)
            } else {
                console.log(`[Tradobot]: Watching for Buy or Sell signals...`)                                    
            }

            let secondsLeft = 60 - new Date().getSeconds()
            let minutesLeft = new Date().getMinutes() % barInterval
            let displaySecs = secondsLeft < 10 ? '0'+secondsLeft : secondsLeft
            let displayMins = minutesLeft < 10 ? '0'+minutesLeft : minutesLeft

            console.log(`\n[${contract.name}](${barInterval}m) (${displayMins}:${displaySecs})\n`)
                
            console.log(`\tprice:\t\t\t${price.toFixed(3)}`)
            
            console.log(`\tshort SMA (${shortPeriod}):\t\t${shortSma.toFixed(3)}`)
            console.log(`\tshort SMA (${midPeriod}):\t\t${midSma.toFixed(3)}`)
            console.log(`\tlong SMA (${longPeriod}):\t\t${longSma.toFixed(3)}`)
    
            console.log(`\topen P&L:\t\t${pl ? '$'+pl.toFixed(2) : '$0.00'}`)
            console.log(`\tcurr pos:\t\t${this.props.position || 0}`)
            console.log(`\trealized P&L:\t\t${
                cashBalances && cashBalances[0].realizedPnL ? '$'+cashBalances[0].realizedPnL.toFixed(2) 
            :                                                    'gathering data...'}`)
            console.log(`\tequity:\t\t\t${cashBalances ? '$'+cashBalances[0].amount.toFixed(2) : 'gathering data...'}`)
        }


        // // // // // // // // // // // // // // // //
        // Decision Loop                             //
        // // // // // // // // // // // // // // // //

        const makeDecision = (item) => {
            const { price, longSma, midSma, shortSma, currentDiff, } = item
            
            drawWatchLoop(price, shortSma, midSma, longSma)

            //buy signal
            if( shortSma > midSma
                //currentDiff is positive when short ma is greater than long ma
                && midSma > longSma
                //last data point should also be lower than most recent data pt
                && data[data.length - 1].price > data[0].price 
            ) {
                return RobotAction.Buy
            }

            //sell signal
            else if(
                shortSma < midSma
                && shortSma < longSma
                && price < shortSma
                && data[data.length - 1].price < data[0].price
            ) {
                return RobotAction.Sell
            }

            return RobotAction.Wait
           
        }
    

        // // // // // // // // // // // // // // // //
        // Run Strategy Section                      //
        // // // // // // // // // // // // // // // //       

        //we can use the MarketDataSocket's getChart function to request bar or tick data
        const dataSubscription = await mdSocket.getChart({
            symbol: contract.name, 
            chartDescription: {
                underlyingType: 'MinuteBar',            
                elementSize: barInterval,
                elementSizeUnit: "UnderlyingUnits",
            },
            timeRange: {
                asManyAsElements: longPeriod
            }
        }, 
        async ({bars}) => { 
            //This is the callback function called for each response from the chart subscription. Data comes in the form of an
            //array of bars, even if we only receive one - but keep in mind that we can receive more than one bar/tick at a time.
            //We must encapsulate our logic in this callback function - including it in an async function outside of this callback
            //would result in the logic herein being run multiple times. We want to run the process one single time per bar/tick
            //so it is best to run any decision-making via this funtion.

            bars.filter(bar => new Date(bar.timestamp) > new Date().getTime() - 1000*60*barInterval*longPeriod) //filter bars within longPeriod from now
                .forEach(async ({timestamp, close}) => {
                    
                    //Filtering and Maintaining the Data Set:
                    let inSameBar = false

                    if( //  1) this bar's time is within your (barInterval * longPeriod) AND
                        //  2) incoming data is a closed bar (will display live price, but calculates only on closes of your barInterval timeframe)
                           new Date(timestamp).getTime() >= new Date().getTime() - 1000 * 60 * barInterval * longPeriod
                    ) {                        
                        let lastDiff = data[data.length - 1]?.diff || 0 

                        if(data.length > 0 && timestamp === data[data.length - 1].timestamp) {
                            inSameBar = true
                            data.pop() //within the same minute, we will replace the most recent data so that live updates occur
                        } else { inSameBar = false }

                        //push data, conservatively keeping data within longPeriod size.
                        let len = data.push({ timestamp, price: close })

                        if(len > longPeriod) {
                            while(data.length > longPeriod) {
                                data.shift() //take data off of front of array - oldest data
                            }
                        }

                        //return if we don't have a complete set of data yet, or we haven't gotten a new bar
                        if(data.length < longPeriod) {
                            return
                        }                        
                    }

                    //If we've gotten to this point, then we have the data we need. There are calculations to be made!

                    const shortSma = calculateSma(shortPeriod, data)    // get the two moving averages
                    const midSma = calculateSma(midPeriod, data)
                    const longSma = calculateSma(longPeriod, data)      // we can calculate the difference between the averages
                    const currentDiff = shortSma - longSma              // as currentDiff. When the currentDiff goes from positive to negative, sell;
                                                                        // when it goes from negative to positive, buy. These are the 'crossovers'.

                    data[data.length - 1].diff = currentDiff            // we need this data...save it to the current (last) entry of the data array (this is the current bar)

                    if(inSameBar) {
                        drawWatchLoop(close, shortSma, midSma, longSma)
                        return
                    }
                    
                                    

                    // this is where we ask the robot to try and make a decision. If it sees a crossover
                    // it will try to buy or sell depending on the direction.
                    let decision = makeDecision({ price: close, longSma, midSma, shortSma, currentDiff }) 

                    if(decision === RobotAction.Wait) {
                        return
                    } else {
                        //This helps ensure we only process a signal one time
                        if(this.mode === RobotMode.Processing) {
                            return
                        } 
                        //If we were processing it returns, if we weren't processing set the robot to processing,
                        this.setMode(RobotMode.Processing)
                        //then lock up the actual process

                        const longBracket = {
                            qty: orderQuantity,
                            profitTarget: takeProfitThreshold,
                            stopLoss: -(Math.ceil(takeProfitThreshold/5)),
                            trailingStop: true
                        }

                        const shortBracket = {
                            qty: orderQuantity,
                            profitTarget: -takeProfitThreshold,
                            stopLoss: (Math.floor(takeProfitThreshold/5)),
                            trailingStop: true
                        }

                        const bracket = decision === RobotAction.Buy ? longBracket : shortBracket

                        const orderData = {
                            entryVersion: {
                                orderQty: orderQuantity,
                                orderType: 'Market',
                            },
                            brackets: [bracket]
                        }

                        const body = {
                            accountId: parseInt(process.env.ID, 10),
                            accountSpec: process.env.SPEC,
                            symbol: contract.name,
                            action: decision,
                            orderStrategyTypeId: 2,
                            params: JSON.stringify(orderData)
                        }

                        let order
                        try {
                            order = await socket.request({
                                url: 'orderstrategy/startorderstrategy',
                                body
                            })
                        } catch (err) {
                            fs.writeFile('./dump.json', JSON.stringify(err, null, 2), () => {})
                        }

                        // await writeOrder(order)
                        this.lastOrder = order                            

                        this.setMode(RobotMode.Watch)

                        this.props.userData = await socket.synchronize()
                    }  
                }
            )
        })
    
        await pressEnterToContinue('exit')
        //if we get here, we know that the loop has been broken.
        dataSubscription() //cancel subscription when the loop is broken to prevent memory leaks
    }

    setMode(nextMode) {
        this.mode = nextMode
    }
   
    static params = {
        ...super.params,
        longPeriod:             'int',
        midPeriod:              'int',
        shortPeriod:            'int',
        barInterval:            'int',
        orderQuantity:          'int',
        takeProfitThreshold:    'int'

    }
}

module.exports = { CrossoverStrategy }