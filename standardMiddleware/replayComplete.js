const { getReplaySocket } = require("../websocket/utils")

const replayComplete = (state, action) => {
    const [event, payload] = action
    
    if(event === 'replay/replayComplete') {
        console.log('[IN REPLAY COMPLETE]')
        const { props } = payload
        const { dispatcher } = props
        const { position } = state

        const socket = getReplaySocket()
        
        let results = {
            finalPos: position?.netPos || 0,
            bought: position?.bought || 0,
            sold: position?.sold || 0,
        }
        
        let disposeFillReq = socket.request({
            url: 'fillPair/list',
            callback: (id, item) => {
                if(id === item.i) {

                    results.fillPairs = item.d
                    console.log('[DISPATCHING SHOW STATS]')
                    dispatcher.dispatch('replay/showStats', { data: results, props })
                    disposeFillReq()                    
                }
            }
        })
    }    

    return action
}

module.exports = { replayComplete }