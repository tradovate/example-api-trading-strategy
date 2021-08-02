const { getSocket, getReplaySocket } = require("../websocket/utils")

const placeOCO = (state, action) => {
    const [event, payload] = action

    if(event === '/order/placeOCO') {
        const { data, props } = payload
        const { dev_mode } = props
        
        const {
            action,
            symbol,
            orderQty,
            orderType,
            price,
            other,
        } = data

        const socket = dev_mode ? getReplaySocket() : getSocket()

        const body = {
            accountSpec: process.env.SPEC,
            accountId: parseInt(process.env.ID, 10),
            action,
            symbol,
            orderQty,
            orderType,
            price,
            isAutomated: true, 
            other
        }
        
        let dispose = socket.request({
            url: 'order/placeOCO',
            body,
            callback: (id, r) => {
                console.log('Placed OCO successfully')
                dispose()
            }
        })
    }
    

    return action
}

module.exports = { placeOCO }