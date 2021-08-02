const { getSocket, getReplaySocket } = require("../websocket/utils")

const placeOrder = (state, action) => {
    const [event, payload] = action

    if(event === '/order/placeOrder') {
        const { data, props } = payload
        const { dev_mode } = props
        const { contract, orderType, action, orderQty, price } = data

        const socket = dev_mode ? getReplaySocket() : getSocket()

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