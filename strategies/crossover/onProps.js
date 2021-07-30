const { writeToLog } = require("../../utils/helpers")
const { EntityType } = require("../strategy/strategy")
const { CrossoverMode } = require("./crossoverMode")

const onProps = (prevState, {data, props}) => {
    const { contract } = props
    const { eventType, entityType, entity } = data
    
    if(entityType === EntityType.Position && eventType === 'Updated' && entity.contractId === contract.id) {
        const { netPos } = entity
        return {
            state: {
                ...prevState,
                mode: 
                    netPos > 0  ? CrossoverMode.Long
                :   netPos < 0  ? CrossoverMode.Short
                :   /*else*/      CrossoverMode.Watch,
                position: entity
            }
        }
    }

    if(entityType === EntityType.Product && contract.name.startsWith(entity.name)) {
        return {
            state: {
                ...prevState,
                product: entity
            },
            effects: [{ event: '/draw' }]
        }
    }

    if(entityType === EntityType.CashBalance) {

        const { realizedPnL } = entity

        return {
            state: {
                ...prevState,
                realizedPnL
            },
            effects: [{ event: '/draw' }]
        }
    }

    return { state: prevState }
}

module.exports = { onProps }