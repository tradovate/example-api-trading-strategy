const fs = require('fs')
const { pressEnterToContinue } = require("../modules/enterToContinue")
const { calculateSma, sumBy, waitForMs, waitUntil } = require("../utils")
const { MarketDataSocket } = require("../websocket/MarketDataSocket")
const { Strategy } = require("./strategy")
const placeOrder = require('../endpoints/placeOrder')
const { runInThisContext } = require('vm')

// // // // // // // // // // // // // // // //
// Instantiate a Market Data Socket          //
// // // // // // // // // // // // // // // //

/** Market Data Socket for gathering the real-time data */
const mdSocket = new MarketDataSocket()

// // // // // // // // // // // // // // // //
// Define RobotMode + RobotAction Enums      //
// // // // // // // // // // // // // // // //

/** The Operation mode that the robot is in. If its last op was Buy, its next op will be Sell. */
const RobotMode = {
    Buy:  '[RobotMode] Buy',
    Sell: '[RobotMode] Sell',
    Wait: '[RobotMode] Wait'
}

/** The Action for the robot to take. */
const RobotAction = {
    Buy: 'Buy',
    Sell: 'Sell',
    Wait: 'Wait'
}

// // // // // // // // // // // // // // // //
// CrossoverStrategy Class                   //
// // // // // // // // // // // // // // // //

/**
 * A Simple Strategy based on two Moving Averages and their interactions.
 */
class CrossoverStrategy extends Strategy {

    constructor(params) {
        super(params)
        this.mode      = RobotMode.Wait
        this.lastOrder = null
        this.inLoop = false
    }
    
    // // // // // // // // // // // // // // // //
    // The Strategy Loop                         //
    // // // // // // // // // // // // // // // //
    
    async run() {
        const { longPeriod, shortPeriod, barType, barInterval, contract, orderQuantity } = this.props
        const data = []
        // const averages = [] 

        // You don't have to do this drawing part - it's only to make it interactive for the example. However,
        // logging is _highly encouraged_. When you've developed your own strategy and you actually 
        // run the robot, you'll want backlogs to see exactly when and where you bought or sold 
        // (Don't log on every tick of course! Just buys and sells)
        const drawWatchLoop = (price, shortSma, longSma) => {
            if(data.length === 0) {
                return
            }
            console.clear()    
            console.log(this.props)

            let currentDiff = shortSma - longSma

            switch(this.mode) {
                case RobotMode.Wait:
                    console.log(`[TRADOBOT]: Watching for Buy or Sell signals...`)                    
                    break

                case RobotMode.Buy:
                    console.log(`[TRADOBOT]: Sold @ ${this.lastOrder.price}. Waiting to buy...`)
                    break

                case RobotMode.Sell:
                    console.log(`[TRADOBOT]: Bought @ ${this.lastOrder.price}. Waiting to sell...`)
                    break
            }

            console.log(`\n[${contract.name}](${barInterval}${barType === 'Tick' ? 't' : 'm'})\n`)
                
            console.log(`\tprice:\t\t\t${price.toFixed(3)}`)
            
            console.log(`\tshort SMA (${shortPeriod}):\t\t${shortSma.toFixed(3)}`)
            console.log(`\tlong SMA (${longPeriod}):\t\t${longSma.toFixed(3)}`)
    
        
            console.log(`\tcurr diff:\t\t${currentDiff.toFixed(3)}`)
        }

        const writeOrder = async order => {
            await fs.readFile('orders.json', async (err, buffer) => {
                if(err) {
                    console.error(err)
                }
                let data = ''

                data += buffer.toString('utf-8')

                let json = JSON.parse(data)
                json.orders.push(order)
                await fs.writeFile('./orders.json', JSON.stringify(json), {}, () => {})
            })
        }

        const makeDecision = async (item) => {
            const { price, longSma, shortSma, currentDiff, timestamp } = item
            if(
                new Date().getTime() - new Date(timestamp).getTime() > 1000*60*30 
                || new Date(timestamp).getTime() - new Date(data[data.length - 1].timestamp).getTime() < 1000*60
            ) {
                return
            }
            
            drawWatchLoop(price, shortSma, longSma)
            
            switch(this.mode) {
                case RobotMode.Wait:
                    //buy signal
                    if(
                        shortSma > longSma
                        && currentDiff > 0
                        && sumBy('diff', data.slice(data.length - shortPeriod))/shortPeriod < 0 //currentDiff was negative, shift to pos
                    ) {
                        this.setMode(RobotMode.Sell)
                        this.lastOrder = { price, timestamp }
                        return RobotAction.Buy
                    }

                    //sell signal
                    else if(
                        shortSma > price 
                        && longSma > price
                        && currentDiff < 0
                        && sumBy('diff', data.slice(data.length - shortPeriod))/shortPeriod > 0 //currentDiff was positive, shift to neg
                    ) {
                        this.setMode(RobotMode.Buy)
                        this.lastOrder = { price, timestamp }
                        return RobotAction.Sell
                    }

                    break

                case RobotMode.Sell:
                    //back-out

                    //sell signal
                    if(
                        shortSma > price 
                        && longSma > price
                        && currentDiff < 0
                        && sumBy('diff', data.slice(data.length - shortPeriod))/shortPeriod > 0 //currentDiff was positive, shift to neg
                    ) {
                        this.setMode(RobotMode.Buy)
                        this.lastOrder = { price, timestamp }
                        return RobotAction.Sell
                    }

                    break

                case RobotMode.Buy:
                    //back-out

                    //buy signal
                    if(
                        shortSma > longSma
                        && currentDiff > 0
                        && sumBy('diff', data.slice(data.length - shortPeriod))/shortPeriod < 0 //currentDiff was negative, shift to pos
                    ) {
                        this.setMode(RobotMode.Sell)
                        this.lastOrder = { price, timestamp }
                        return RobotAction.Buy
                    }

                    break
            }

            return RobotAction.Wait
           
        }

        const tickHandler = async ({eoh, bt, bp, tks}) => {
            tks.forEach(async ({t, p}) => {
                const timestamp = bt + t
                const price = bp + p
    
                data.push({ timestamp, price }) 
    
                const shortSma = calculateSma(shortPeriod, data)
                const longSma = calculateSma(longPeriod, data)
                const currentDiff = shortSma - longSma
    
                await checkSignals({ price, longSma, shortSma, currentDiff, timestamp })                
            })
        }
        
        const barHandler = async ({bars}) => {
            bars.filter(bar => new Date(bar.timestamp) > new Date().getTime() - 1000*60*30) 

                .forEach(async ({timestamp, close}) => {
                
                if( data.length < 1
                    && (new Date(timestamp).getTime() < new Date().getTime() - 1000 * 60 * 30
                    || new Date(timestamp).getTime() - new Date(data[data.length - 1]?.timestamp).getTime() < 1000*60)
                ) {
                    return
                }
                if(data.length === 0 || new Date(timestamp).getTime() > new Date(data[data.length-1].timestamp).getTime()) {
                    let l = data.push({ timestamp, price: close })
                    if(l > longPeriod) {
                        data.shift()
                    }
                }
                if(data.length < longPeriod) {
                    return
                }
                data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                const shortSma = calculateSma(shortPeriod, data)
                const longSma = calculateSma(longPeriod, data)
                const currentDiff = shortSma - longSma
                data[data.length - 1].diff = currentDiff        
    
                let decision = await makeDecision({ price: close, longSma, shortSma, currentDiff }) 

                if(decision === RobotAction.Wait) return

                else {
                    const order = await placeOrder({
                        action: decision,
                        symbol: contract.name,
                        orderQty: orderQuantity,
                        orderType: 'Market',
                    })
                }
            })
        }
    
        console.log(`[Tradobot]: Connecting WebSocket...`)
    
        await mdSocket.connect(process.env.MD_URL)
        const asFarAsTimestamp = new Date()
        asFarAsTimestamp.setHours(new Date().getHours() - 1)

        const dataSubscription = await mdSocket.getChart({
            symbol: contract.name, 
            chartDescription: {
                underlyingType: barType,
                elementSize: barType === 'Tick' ? 1 : barInterval,
                elementSizeUnit: "UnderlyingUnits",
            },
            timeRange: {
                // closestTimestamp: JSON.stringify(new Date(new Date().getTime() + 1000 * 60 * 60 * 24)),
                // asFarAsTimestamp: JSON.stringify(asFarAsTimestamp),
                asManyAsElements: longPeriod
            }
        }, barType === 'Tick' ? tickHandler : barHandler)
    
    
        // // // // // // // // // // // // // // // //
        // Run Strategy Section                      //
        // // // // // // // // // // // // // // // //
    
        await drawWatchLoop(0, 0, 0)
    
        await pressEnterToContinue('exit')
    }

    setMode(nextMode) {
        this.mode = nextMode
    }

   
    static params = {
        ...super.params,
        longPeriod: 'int',
        shortPeriod: 'int',
        barType: {
            MinuteBar: 'MinuteBar',
            Tick: 'Tick'
        },
        barInterval: 'int',
        orderQuantity: 'int',

    }
}

module.exports = { CrossoverStrategy }