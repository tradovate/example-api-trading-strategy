const { readFile, waitUntil } = require("../utils")
const path = require('path')
const fs = require('fs')
const { pressEnterToContinue } = require("./enterToContinue")
const orderItem = require("../endpoints/orderItem")

const getHistory = async () => {
    console.log(`[Tradobot] Order History:`)
    let gotHistory = false

    await fs.readFile('orders.json', async (err, buffer) => {
        let file = ''
        if(!err) {
            file += buffer.toString('utf-8')
        }

        const history = JSON.parse(file)

        if(history.orders.length < 1) {
            console.log('[Tradobot]: No order history to show.')
            await pressEnterToContinue()
            gotHistory = true
        } else {
            for(let i = 0; i < history.orders.length; i++) {
                const { orderId } = history.orders[i]
                const order = await orderItem(orderId)
                console.log(order)
                // console.log(`${item.action === 'Buy' ? `Bought` : `Sold`} ${item.asset} @ ${item.price}.${item.lastPrice ? `Net change: ${item.lastItem.action === 'Buy' ? `${item.price - item.lastPrice}` : `${item.lastPrice - item.price}`}` : ''}`)
            }        
            await pressEnterToContinue()
            gotHistory = true
        }
    })
    


    await waitUntil(() => gotHistory)

}

module.exports = { getHistory }