const highLowVariance = require("../modules/highLowVariance")
const twoLineCrossover = require("../modules/twoLineCrossover")
const { calculateSma, sumBy, writeToLog } = require("../utils/helpers")
const { Strategy } = require("./strategy")


// // // // // // // // // // // // // // // //
// Define RobotMode Enums                    //
// // // // // // // // // // // // // // // //
const RobotMode = {
    Long:       '[RobotMode] Long',
    Short:      '[RobotMode] Short', 
    Watch:      '[RobotMode] Watch',
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
    constructor(props) {
        super(props)
        //set the default state, this can actually be anything but a string will suffice for crossover
        let position = this.getPosition()
        this.state =
            position && position.netPos > 0 ? RobotMode.Long 
        :   position && position.netPos < 0 ? RobotMode.Short
        :   /*else*/                          RobotMode.Watch

        this.hlv = highLowVariance(this.props.variancePeriod)

        this.tlc = twoLineCrossover(this.props.shortPeriod, this.props.longPeriod)
    }
    
    // // // // // // // // // // // // // // // //
    // Strategy Tick Handler                     //
    // // // // // // // // // // // // // // // //
    
    tick(prevState, tickData) {
        //Must make a call to super.tick! (Unless you want to override how the default DataBuffer works)
        super.tick(prevState, tickData)       

        const { buffer } = this //the buffer is the transformed, usable data from your tick stream.

        const data = buffer.getData()

        //run your module's tick handlers
        const { positiveCrossover, negativeCrossover } = this.tlc(this.tlc.state, data).state
        
        const { variance } = this.hlv(this.hlv.state, data).state

        const { marketVarianceMinimum } = this.props

        const position = this.getPosition() //returns current position for this contract, if any (you may not have traded this contract yet)

        console.clear()
        console.log(`state:\t\t\t${this.state}`)
        console.log(`variance:\t\t${variance}`)
        console.log(`position:\t\t${position?.netPos || 0}`)
        console.log(`open P&L:\t\t$${this.getOpenPnL(buffer.last().price).toFixed(2)}`)
        console.log(`realized P&L:\t\t$${this.props.userData.cashBalances[0]?.realizedPnL || 0}`)

        switch(prevState) {
            case RobotMode.Watch: {
                if(negativeCrossover && variance > marketVarianceMinimum) {
                    this.startStrategy('Sell')
                    return RobotMode.Short
                }
                else if(positiveCrossover && variance > marketVarianceMinimum) {
                    this.startStrategy('Buy')
                    return RobotMode.Long
                }
                else {
                    return RobotMode.Watch
                }
            }

            case RobotMode.Long: {
                if(position && position.netPos === 0) {
                    return RobotMode.Watch
                }
                else {
                    return RobotMode.Long
                }    
            }

            case RobotMode.Short: {
                if(position && position.netPos === 0) {
                    return RobotMode.Watch
                }
                else {
                    return RobotMode.Short
                }    
            }

            default: {
                return prevState
            }
        }
    }

    startStrategy(buyOrSell) {
        const { takeProfitThreshold, orderQuantity, contract } = this.props

        const longBracket = {
            qty: orderQuantity,
            profitTarget: takeProfitThreshold,
            stopLoss: -(Math.floor(takeProfitThreshold/5)),
            trailingStop: true
        }
          
        const shortBracket = {
            qty: orderQuantity,
            profitTarget: -takeProfitThreshold,
            stopLoss: (Math.ceil(takeProfitThreshold/5)),
            trailingStop: true
        }
        
        const bracket = buyOrSell === 'Buy' ? longBracket : shortBracket
        
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
            action: buyOrSell,
            orderStrategyTypeId: 2,
            params: JSON.stringify(orderData)
        }

        let dispose = this.socket.request({
            url: 'orderStrategy/startOrderStrategy',
            body,
            callback: (id, r) => {
                if(id === r.id) {
                    console.log('Started order strategy...')
                    writeToLog(r) 
                    dispose()
                }
            }
        })
    }
   
    static params = {
        ...super.params,
        longPeriod:             'int',
        shortPeriod:            'int',
        variancePeriod:         'int',
        orderQuantity:          'int',
        takeProfitThreshold:    'float',
        marketVarianceMinimum:  'float'

    }
}

module.exports = { CrossoverStrategy }