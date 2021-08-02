const { writeToLog } = require("../../utils/helpers")
const { EntityType } = require("../strategy/strategy")
const { CrossoverMode } = require("./crossoverMode")

const onProps = (prevState, {data, props}) => {
    const { contract } = props
    const { eventType, entityType, entity } = data
    
    if(entityType === EntityType.Position && entity.contractId === contract.id) {
        const { netPos } = entity
        return {
            state: {
                ...prevState,
                mode: 
                    netPos > 0  ? CrossoverMode.Long
                :   netPos < 0  ? CrossoverMode.Short
                :   /*else*/      CrossoverMode.Watch,
                position: entity
            },
            effects: [
                {
                    url: 'product/find',
                    data: {
                        name: contract.name.slice(0, contract.name.length - 2)
                    }
                }
            ]
        }
    }

    if(entityType === EntityType.CashBalance) {

        const { realizedPnL } = entity

        return {
            state: {
                ...prevState,
                realizedPnL
            },
            effects: [{ event: 'crossover/draw' }]
        }
    }

    return { state: prevState }
}

module.exports = { onProps }