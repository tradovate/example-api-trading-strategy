const { acquireAccess } = require("./utils/acquireAccess")
const { configureRobot } = require("./utils/configureRobot")
const { CrossoverStrategy } = require("./strategies/crossover/crossoverStrategy")
const { YourCustomStrategy } = require("./strategies/yourCustomStrategy/yourCustomStrategy")
const { askForContract } = require("./utils/askForContract")
const { ReplaySocket } = require("./websocket/ReplaySocket")
const { getSocket, getMdSocket, getReplaySocket, connectSockets } = require("./websocket/utils")
const { askForReplay } = require("./utils/askForReplay")
const { PriceDisplayStrategy } = require("./strategies/priceDisplay/priceDisplayStrategy")
const { PriceDisplayStrategyFP } = require("./strategies/priceDisplayFP/priceDisplayStrategyFP")
const { RsiStrategy } = require("./strategies/rsiStrategy/rsiStrategy")

//ENVIRONMENT VARIABLES ---------------------------------------------------------------------------------------

//Set some process variables for ease-of-access. These values will be globally available
//through the process.env object. This is part of the configuration of the robot,
//so be sure to use the correct values here.

// - HTTP_URL can be changed to either the demo or live variant. Demo uses your 
//   demo account (if you have one)
// - USER should be your username or email used for your Trader account
// - PASS should be the password assoc with that account

process.env.HTTP_URL    = 'https://demo.tradovateapi.com/v1'
process.env.WS_URL      = 'wss://demo.tradovateapi.com/v1/websocket'
process.env.MD_URL      = 'wss://md.tradovateapi.com/v1/websocket'
process.env.REPLAY_URL  = 'wss://replay.tradovateapi.com/v1/websocket'
process.env.USER        = ''    
process.env.PASS        = '' 
process.env.SEC         = ''
process.env.CID         = 0

//END ENVIRONMENT VARIABLES -----------------------------------------------------------------------------------

const ALL_STRATEGIES = {
    'Crossover Strategy': CrossoverStrategy,
    'RSI Strategy': RsiStrategy,
    'Your Custom Strategy': YourCustomStrategy
}

//Replay times must be JSON strings!
//const REPLAY_TIMES = [
    //{
        //start: new Date(`2021-07-28T22:30`).toJSON(), //use your local time, .toJSON will transform it to universal
        //stop: new Date(`2021-07-28T22:31`).toJSON()
    //},
    //{
        //start: new Date(`2021-07-28T22:31`).toJSON(),
        //stop: new Date(`2021-07-28T22:32`).toJSON(),
    //}
//]

/**
 * Program entry point.
 */
async function main() {

    // // // // // // // // // // // // // // // //
    // Login Section                             //
    // // // // // // // // // // // // // // // //

    await acquireAccess()

    // // // // // // // // // // // // // // // //
    // Configuration Section                     //
    // // // // // // // // // // // // // // // //

    //const maybeReplayString = await askForReplay(REPLAY_TIMES)

    //if(maybeReplayString) {
        //const replaySocket = getReplaySocket()
        //await replaySocket.connect(process.env.REPLAY_URL)
    //} else {
        const socket = getSocket()
        const mdSocket = getMdSocket()

        await Promise.all([
            socket.connect(process.env.WS_URL),
            mdSocket.connect(process.env.MD_URL)
        ])
    //}
    
    const Strategy = await configureRobot(ALL_STRATEGIES)
    Strategy.init()
    
    //COMMENT ABOVE, UNCOMMENT BELOW you want to parameterize the strategy here instead of via console.
    
    // let contract1 = await askForContract()

    // while(!contract1) {
    //     contract1 = await askForContract(true)
    // }

    // const rsi = new RsiStrategy({
    //     contract: contract1,
    //     barType: 'MinuteBar',
    //     barInterval: 30,
    //     elementSizeUnit: 'UnderlyingUnits',
    //     histogram: false,
    //     timeRangeType: 'asMuchAsElements',
    //     timeRangeValue: 14,
    //     dev_mode: !!maybeReplayString,
    //     replay_periods: REPLAY_TIMES,
    //     period: 14,
    //     orderQuantity: 1,
    // })

    // const display = new PriceDisplayStrategyFP({
    //     contract: contract1,
    //     barType: 'MinuteBar',
    //     barInterval: 1,
    //     elementSizeUnit: 'UnderlyingUnits',
    //     histogram: false,
    //     timeRangeType: 'asMuchAsElements',
    //     timeRangeValue: 1,
    //     dev_mode: !!maybeReplayString,
    //     replay_periods: REPLAY_TIMES
    // })    
}

main()