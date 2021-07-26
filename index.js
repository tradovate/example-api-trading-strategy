const { acquireAccess } = require("./utils/acquireAccess")
const { configureRobot } = require("./utils/configureRobot")
const { CrossoverStrategy } = require("./strategies/crossover/crossoverStrategy")
const { YourCustomStrategy } = require("./strategies/yourCustomStrategy")
const { askForContract } = require("./utils/askForContract")
const { ReplaySocket } = require("./websocket/ReplaySocket")
const { getSocket, getMdSocket, getReplaySocket } = require("./websocket/utils")

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
    'Your Custom Strategy': YourCustomStrategy
}

/**
 * Program entry point.
 */
async function main() {

    // // // // // // // // // // // // // // // //
    // Login Section                             //
    // // // // // // // // // // // // // // // //

    await acquireAccess()

    const socket = getSocket()
    const mdSocket = getMdSocket()
    const replaySocket = getReplaySocket()

    await Promise.all([
        socket.connect(process.env.WS_URL),
        mdSocket.connect(process.env.MD_URL),
        replaySocket.connect(process.env.REPLAY_URL)    
    ])

    // // // // // // // // // // // // // // // //
    // Configuration Section                     //
    // // // // // // // // // // // // // // // //

    const Strategy = await configureRobot(ALL_STRATEGIES)

    //COMMENT ABOVE, UNCOMMENT BELOW if you want to parameterize the strategy here instead of via console.

    // let contract1 = await askForContract()

    // while(!contract1) {
    //     contract1 = await askForContract(true)
    // }

    // const strategy1 = new CrossoverStrategy({
    //     contract: contract1,
    //     barType: 'MinuteBar',
    //     barInterval: 5,
    //     elementSizeUnit: 'UnderlyingUnits',
    //     histogram: false,
    //     timeRangeType: 'asMuchAsElements',
    //     timeRangeValue: 41,
    //     longPeriod: 13,
    //     shortPeriod: 5,
    //     variancePeriod: 41,
    //     orderQuantity: 10
    // })
}

main()