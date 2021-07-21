const placeOrder = (state, action) => {
    const [event, payload] = action

    if(event === '/order/placeOrder') {
        const { contract, orderType, action, orderQty, price } = payload

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
    }
    

    return action
}

module.exports = { placeOrder }