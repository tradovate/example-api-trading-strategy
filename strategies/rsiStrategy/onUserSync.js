const { CrossoverMode } = require("../common/crossoverMode")

const onUserSync = (prevState, {data, props}) => {

    const { contract } = props
    const { positions, products, cashBalances } = data
    
    let product = products.find(p => contract.name.startsWith(p.name))
    const position = positions.find(pos => pos.contractId === contract.id)
    let realizedPnL = cashBalances[0]?.realizedPnL || 0

    return {
        state: {
            ...prevState,
            mode: 
                position && position.netPos > 0 ? CrossoverMode.Long 
            :   position && position.netPos < 0 ? CrossoverMode.Short 
            :   /*else*/                          CrossoverMode.Watch,
            product,
            position,
            realizedPnL
        },
        effects: [{ event: 'rsi/draw' }]
    }
}

module.exports = { onUserSync }