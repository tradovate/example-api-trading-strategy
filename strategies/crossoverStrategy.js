const calculatePnL = require("../modules/calculatePnL")
const highLowVariance = require("../modules/highLowVariance")
const twoLineCrossover = require("../modules/twoLineCrossover")
const { DataBuffer, BarsTransformer } = require("../utils/dataBuffer")
const drawToConsole = require("../utils/drawToConsole")
const { Strategy, TdEvent } = require("./strategy")

const RobotMode = {
    Long:       '[RobotMode] Long',
    Short:      '[RobotMode] Short', 
    Watch:      '[RobotMode] Watch',
}

/**
 * A Simple Strategy based on two Moving Averages and their interactions.
 */
class CrossoverStrategy extends Strategy {

    /** 
     * This is where we initialize the CrossoverStrategy class instance.
     * We wait for our websockets to be connected and the set this.initialized to true so that our main loop can carry on (it waits on Strategy.initialized)
     */
    constructor(props) {
        super(props)        
    }

    init(props) {
        return {
            mode:       RobotMode.Watch,
            buffer:     new DataBuffer(BarsTransformer),
            tlc:        twoLineCrossover(props.shortPeriod, props.longPeriod),
            hlv:        highLowVariance(props.variancePeriod),
            product:    null,
            position:   null
        }
    }
    
    next(prevState, dependencies) {
        const { event, props } = dependencies  
        const { contract } = props
        const { product, position, mode, buffer } = prevState

        if(product && position) {
            drawToConsole({
                mode,
                netPos: position.netPos,
                'p&l': `$${calculatePnL({
                    price: buffer.last()?.close || buffer.last()?.price || 0,
                    contract,
                    position,
                    product,
                }).toFixed(2)}`
            })
        }

        switch(event) {
            case TdEvent.Chart: {
                return this.onChart(prevState, dependencies)
            }

            case TdEvent.Props: {
                return this.onProps(prevState, dependencies)
            }

            case TdEvent.UserSync: {
                return this.onUserSync(prevState, dependencies)
            }

            default: {
                return prevState
            }
        }
    }

    onUserSync(prevState, {data, props, api}) {

        const { contract }  = props
        const { positions, products } = data
        
        const product = products.find(p => contract.name.startsWith(p.name))
        const position = positions.find(pos => pos.contractId === contract.id)

        return {
            ...prevState,
            product,
            position,
        }
    }
    
    onProps(prevState, {data, props, api}) {
        const { eventType, entityType, entity } = data
        const { product } = props

        if(entityType === 'position' && eventType === 'Updated') {
            return {
                ...prevState,
                mode: 
                    netPos > 0  ? RobotMode.Long
                :   netPos < 0  ? RobotMode.Short
                :   /*else*/      RobotMode.Watch,
                position

            }
        }

        return prevState
    }

    onChart(prevState, {data, props, api}) {
        
        const { mode, buffer, hlv, tlc, } = prevState
        const { contract, orderQuantity } = props
        
        buffer.push(data)        

        const { variance } = hlv(hlv.state, buffer).state
        const { negativeCrossover, positiveCrossover } = tlc(tlc.state, buffer).state
        
        const longBracket = {
            qty: orderQuantity,
            profitTarget: variance,
            stopLoss: -(Math.floor(variance/6)),
            trailingStop: true
        }
          
        const shortBracket = {
            qty: orderQuantity,
            profitTarget: -variance,
            stopLoss: (Math.ceil(variance/6)),
            trailingStop: true
        }

        const entryVersion = {
            orderQty: orderQuantity,
            orderType: 'Market',
        }
        
        if(mode === RobotMode.Watch) {
            if(negativeCrossover) {
                api.startOrderStrategy({
                    contract,
                    action: 'Sell',
                    brackets: [shortBracket],
                    entryVersion
                })
                return {
                    ...prevState,
                    mode: RobotMode.Short,
                }
            }
            else if(positiveCrossover) {
                api.startOrderStrategy({
                    contract,
                    action: 'Buy',
                    brackets: [longBracket],
                    entryVersion
                })
                return {
                    ...prevState,
                    mode: RobotMode.Long,
                }
            }

            return prevState            
        }
    }
   
    static params = {
        ...super.params,
        longPeriod:             'int',
        shortPeriod:            'int',
        variancePeriod:         'int',
        orderQuantity:          'int',
    }
}



module.exports = { CrossoverStrategy }