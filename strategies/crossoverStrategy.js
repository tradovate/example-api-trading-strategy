const { calculateSma } = require("../utils")
const { MarketDataSocket } = require("../websocket/MarketDataSocket")

const mdSocket = new MarketDataSocket()

function CrossoverStrategy(params) {
    this.props = params
    const { longPeriod, shortPeriod, barType, barInterval, contract } = this.props

    this.run = async function() {
        const data = []
        const averages = [] 

        const drawWatchLoop = async (price, shortSma, longSma) => {
            console.clear()    
            console.log(params)
            
            console.log(`[TRADOBOT]: Watching for Buy or Sell signals...`)
            console.log(`\n[${contract.name}](${barInterval}${barType === 'Ticks' ? 't' : 'm'})`)
        
            console.log(`\tprice:\t\t${price.toFixed(3)}`)
            
            console.log(`\tlong SMA (${longPeriod}):\t${longSma.toFixed(3)}`)
            console.log(`\tshort SMA (${shortPeriod}):\t${shortSma.toFixed(3)}`)
    
            let avgDiff = averages.length > longPeriod ? averages.slice(averages.length - 1 - longPeriod).reduce((a, b) => a + b, 0) : 0
            let currentDiff = shortSma - longSma
        
            console.log(`\tavg diff: \t${avgDiff !== 0 ? avgDiff.toFixed(3) : '<waiting for more data>'}`)
            console.log(`\tcurr diff: \t${currentDiff.toFixed(3)}`)
    
            return drawWatchLoop
        }
    
        const tickHandler = async ({eoh, bt, bp, tks}) => {
            console.log(`[TRADOBOT]: Loading historical data...`)
            tks.forEach(async ({t, p}) => {
                const timestamp = bt + t
                const price = bp + p
    
                data.push({ timestamp, price }) 
    
                const shortSma = calculateSma(longPeriod, data)
                const longSma = calculateSma(shortPeriod, data)
                const currentDiff = shortSma - longSma
    
                averages.push(currentDiff)
    
                drawWatchLoop(price, shortSma, longSma)
            })
        }
        
        const barHandler = async ({bars}) => { 
            console.log(bars)
            const { shortPeriod, longPeriod } = params   
        
            bars.forEach(async ({timestamp, close}) => {
                if(data.length === 0 || new Date(timestamp).getTime() > new Date(data[data.length-1].timestamp).getTime()){
                    data.push({ timestamp, price: close })
                }
                const shortSma = calculateSma(longPeriod, data)
                const longSma = calculateSma(shortPeriod, data)
                const currentDiff = shortSma - longSma
        
                averages.push(currentDiff)
    
                drawWatchLoop(close, shortSma, longSma)
            })
        }
    
        console.log(`[Tradobot]: Connecting WebSocket...`)
    
        await mdSocket.connect(process.env.MD_URL)
    
        const dataSubscription = await mdSocket.getChart({
            symbol: contract.name, 
            chartDescription: {
                underlyingType: params.barType,
                elementSize: params.barType === 'Tick' ? 1 : params.barInterval,
                elementSizeUnit: "UnderlyingUnits",
            },
            timeRange: {
                asFarAsTimestamp: '2020-06-01T10:00Z'
            }
        }, params.barType === 'Tick' ? tickHandler : barHandler)
    
    
        // // // // // // // // // // // // // // // //
        // Run Strategy Section                      //
        // // // // // // // // // // // // // // // //
    
        drawWatchLoop(0, 0, 0)
    
        await pressEnterToContinue('exit')
    }
}

CrossoverStrategy.params = {
    longPeriod: 'int',
    shortPeriod: 'int'
}

module.exports = { CrossoverStrategy }