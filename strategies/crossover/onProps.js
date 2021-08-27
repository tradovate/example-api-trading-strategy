const { writeToLog } = require("../../utils/helpers")
const { LongShortMode } = require("../common/longShortMode")
const { EntityType } = require("../strategy/entityType")

const onProps = (prevState, {data, props}) => {
    const { contract } = props
    const { entityType, entity } = data
    
    if(entityType === EntityType.Position && entity.contractId === contract.id) {
        const { netPos } = entity
        return {
            state: {
                ...prevState,
                mode: 
                    netPos > 0  ? LongShortMode.Long
                :   netPos < 0  ? LongShortMode.Short
                :   /*else*/      LongShortMode.Watch,
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