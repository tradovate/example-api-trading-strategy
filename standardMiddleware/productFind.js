const { getSocket, getReplaySocket } = require("../websocket/utils")

const productFind = (state, action) => {
    const [event, payload] = action

    if(event === 'product/find') {
        const { data, props } = payload
        const { dev_mode, dispatcher } = props
        const { name } = data

        const socket = dev_mode ? getReplaySocket() : getSocket()

        let dispose = socket.request({
            url: 'product/find',
            query: `name=${name}`,
            callback: (id, r) => {
                if(r.i === id) { 
                    console.log(r)
                    dispatcher.dispatch('product/found', { data: { entity: r.d }, props })
                    dispose()
                }
            }
        })
    }    

    return action
}

module.exports = { productFind }