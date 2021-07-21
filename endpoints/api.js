const { writeToLog } = require("../utils/helpers")

const makeSocketApi = socket => ({

    placeOrder({contract, orderType, action, orderQty, price = undefined}) {
        const body = {
            symbol: contract.name,
            orderQty,
            accountSpec: process.env.SPEC,
            accountId: parseInt(process.env.ID, 10),
            action,
            price,
            orderType,
            isAutomated: true

        }
        let dispose = socket.request({
            url: 'order/placeOrder',
            body,
            callback: (id, r) => {
                console.log('Placed order successfully')
                dispose()
            }
        })
    },

    productItem(contract, callback) {
        let dispose = socket.request({
            url: 'product/find',
            query: contract.name,
            callback: (id, r) => {
                if(id === r.id) {
                    callback(r)
                    dispose()
                }
            }
        })
    },

    startOrderStrategy({contract, action, brackets, entryVersion}) {
        
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