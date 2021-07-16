const { writeToLog } = require("../utils/helpers")

const makeSocketApi = socket => ({
    startOrderStrategy({contract, action, brackets, entryVersion}) {

        //I'll be wanting this later...
        // const longBracket = {
        //     qty: orderQuantity,
        //     profitTarget: takeProfitThreshold,
        //     stopLoss: -(Math.floor(takeProfitThreshold/5)),
        //     trailingStop: true
        // }
          
        // const shortBracket = {
        //     qty: orderQuantity,
        //     profitTarget: -takeProfitThreshold,
        //     stopLoss: (Math.ceil(takeProfitThreshold/5)),
        //     trailingStop: true
        // }
        // const entry = {
        //     orderQty: orderQuantity,
        //     orderType: 'Market',
        // },
        
        // const bracket = action === 'Buy' ? longBracket : shortBracket
        
        const orderData = {
            entryVersion,
            brackets
        }
        
        const body = {
            accountId: parseInt(process.env.ID, 10),
            accountSpec: process.env.SPEC,
            symbol: contract.name,
            action,
            orderStrategyTypeId: 2,
            params: JSON.stringify(orderData)
        }

        let dispose = socket.request({
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
})

module.exports = { makeSocketApi }