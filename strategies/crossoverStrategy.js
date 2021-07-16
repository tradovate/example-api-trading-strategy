const calculatePnL = require("../utils/calculatePnL")
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
            position:   null,
            gotNeg:     false,
            gotPos:     false,
        }
    }
    
    next(prevState, dependencies) {
        const { event, props } = dependencies  
        const { contract } = props
        const { product, position, mode, buffer, gotPos, gotNeg } = prevState

        drawToConsole({
            mode,
            contract: contract.name,
            gotPos: (mode === RobotMode.Long || gotPos) ? '!' : '',
            gotNeg: (mode === RobotMode.Short || gotNeg) ? '!' : '',            
            netPos: position?.netPos || 0,
            'p&l': position ? `$${calculatePnL({
                price: buffer.last()?.close || buffer.last()?.price || 0,
                contract,
                position,
                product,
            }).toFixed(2)}` : '$0.00'
        })    

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

            case 'response': {
                return {
                    ...prevState,
                    product: data
                }
            }

            default: {
                return prevState
            }
        }
    }

    onUserSync(prevState, {data, props, api}) {

        // console.log('got user sync')
        // console.log(prevState)
        const { contract } = props
        const { positions, products } = data
        
        let product = products.find(p => contract.name.startsWith(p.name))
        const position = positions.find(pos => pos.contractId === contract.id)

        return {
            ...prevState,
            mode: 
                position && position.netPos > 0 ? RobotMode.Long 
            :   position && position.netPos < 0 ? RobotMode.Short 
            :   /*else*/                          RobotMode.Watch,
            product,
            position,
        }
    }
    
    onProps(prevState, {data, props, api}) {
        const { eventType, entityType, entity } = data
        const { netPos } = entity

        if(entityType === 'position' && eventType === 'Updated') {
            return {
                ...prevState,
                mode: 
                    netPos > 0  ? RobotMode.Long
                :   netPos < 0  ? RobotMode.Short
                :   /*else*/      RobotMode.Watch,
                position: entity
            }
        }

        return prevState
    }

    onChart(prevState, {data, props, api}) {
        // console.log('got chart')
        // console.log(prevState)
        const { mode, buffer, hlv, tlc, } = prevState
        const { contract, orderQuantity } = props
        
        buffer.push(data)        
        
        // console.log(JSON.stringify(buffer.getData()))
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
                    gotNeg: true,
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
                    gotPos: true,
                    mode: RobotMode.Long,
                }
            }

            return prevState            
        }
        return prevState
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