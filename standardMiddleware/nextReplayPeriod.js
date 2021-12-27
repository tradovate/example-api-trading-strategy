const calculatePnL = require("../utils/calculatePnL")
const {  getReplaySocket, getSessionResults } = require("../websocket/utils")

const nextReplayPeriod = (state, action) => {
    const [event, payload] = action

    if(event === 'replay/nextReplayPeriod') {
        console.log('[GOT TO NEXT REPLAY]')
        const { data, props } = payload
        const { current_period, position, realizedPnL, buffer, product } = state
        const { dispatcher, replay_periods } = props

        let modified_period = current_period - 1
        if(modified_period - 1 < replay_periods.length){
            const sessionResults = getSessionResults()
            //set results of this session
            sessionResults[`${replay_periods[modified_period].start} to ${replay_periods[modified_period].stop}`] = {
                finalPos: position?.netPos || 0,
                bought: position?.bought || 0,
                sold: position?.sold || 0,
                realizedPnL: `$${realizedPnL}`,
                openPnL: `$${calculatePnL({
                    price: buffer.last().close,
                    product, 
                    position
                }).toFixed(2)}`
            }
            console.log(sessionResults)
        }

        if(current_period === replay_periods.length) {
            console.log('[DISPATCHED REPLAY COMPLETE]')
            dispatcher.dispatch('replay/replayComplete', payload)
            return action
        } else {
            console.log('[TRIED RESET REPLAY]')

            const socket = getReplaySocket()

            let originalSocket = socket.getSocket()

            socket.connect(process.env.REPLAY_URL).then(() => {
                originalSocket.removeAllListeners('message')
                originalSocket.close(1000, `Client initiated disconnect.`)

                let disposerA, disposerB, disposerC
                disposerA = socket.checkReplaySession({
                    startTimestamp: replay_periods[current_period].start,
                    
                    callback: (item) => {
                        console.log('[MADE IT TO CHECK SESSION]')
                        if(item.checkStatus && item.checkStatus === 'OK') {
        
                            disposerB = socket.initializeClock({
                                startTimestamp: replay_periods[current_period].start,
                                callback: (item) => {

                                    if(item) return // integral call! we only want to run this code once 

                                    console.log('[MADE IT TO INIT CLOCK]')
                                    
    
                                    disposerC = socket.request({
                                        url: 'account/list',
                                        callback: (id, item) => {
                                            
                                            if(id === item.i) {
    
                                                console.log('[MADE IT TO INNERMOST CB]')
    
                                                const accounts = item.d
                                                const account = accounts.find(acct => acct.active)
                                                console.log(account)
                                                
                                                process.env.ACCOUNT = JSON.stringify(account)
                                                process.env.ID = account.id,
                                                process.env.SPEC = account.name
                                                process.env.USER_ID = account.userId
                                                
                                                dispatcher.dispatch('replay/resetEventHandlers', payload)
        
                                                disposerA()
                                                disposerB()
                                                disposerC()
                                                // console.log(socket.ws.listeners())
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    }
                }) 
            })
        }
        return action            
    }    
    return action
}

module.exports = { nextReplayPeriod }