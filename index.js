const { acquireAccess } = require("./utils/acquireAccess")
const { configureRobot } = require("./utils/configureRobot")
const { CrossoverStrategy } = require("./strategies/crossover/crossoverStrategy")
const { YourCustomStrategy } = require("./strategies/yourCustomStrategy/yourCustomStrategy")
const { askForContract } = require("./utils/askForContract")
const { ReplaySocket } = require("./websocket/ReplaySocket")
const { getSocket, getMdSocket, getReplaySocket, connectSockets } = require("./websocket/utils")
const { askForReplay } = require("./utils/askForReplay")

//ENVIRONMENT VARIABLES ---------------------------------------------------------------------------------------

//Set some process variables for ease-of-access. These values will be globally available
//through the process.env object. This is part of the configuration of the robot,
//so be sure to use the correct values here.

// - HTTP_URL can be changed to either the demo or live variant. Demo uses your 
//   demo account (if you have one)
// - USER should be your username or email used for your Trader account
// - PASS should be the password assoc with that account

process.env.HTTP_URL    = 'https://demo-d.tradovateapi.com/v1'
process.env.WS_URL      = 'wss://demo-d.tradovateapi.com/v1/websocket'
process.env.MD_URL      = 'wss://md-d.tradovateapi.com/v1/websocket'
process.env.REPLAY_URL  = 'wss://replay-d.tradovateapi.com/v1/websocket'
process.env.USER        = 'alennert02'    
process.env.PASS        = 'YumD00d24!' 
process.env.SEC         = 'f03741b6-f634-48d6-9308-c8fb871150c2'
process.env.CID         = 8

//END ENVIRONMENT VARIABLES -----------------------------------------------------------------------------------

const ALL_STRATEGIES = {
    'Crossover Strategy': CrossoverStrategy,
    'Your Custom Strategy': YourCustomStrategy
}

//Replay times must be JSON strings!
const REPLAY_TIMES = [
    {
        start: new Date(`2021-07-28T22:30`).toJSON(), //use your local time, .toJSON will transform it to universal
        stop: new Date(`2021-07-28T22:31`).toJSON()
    },
    {
        start: new Date(`2021-07-28T22:31`).toJSON(),
        stop: new Date(`2021-07-28T22:32`).toJSON(),
    }
]

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

    const maybeReplayString = await askForReplay(REPLAY_TIMES)

    if(maybeReplayString) {
        const replaySocket = getReplaySocket()
        await replaySocket.connect(process.env.REPLAY_URL)
    } else {
        const socket = getSocket()
        const mdSocket = getMdSocket()

        await Promise.all([
            socket.connect(process.env.WS_URL),
            mdSocket.connect(process.env.MD_URL)
        ])
    }

    // const Strategy = await configureRobot(ALL_STRATEGIES)

    //COMMENT ABOVE, UNCOMMENT BELOW you want to parameterize the strategy here instead of via console.
    // const minus24h = new Date(new Date().getTime() - 1000*60*60*24)
    // minus24h.setHours(7)

    let contract1 = await askForContract()

    while(!contract1) {
        contract1 = await askForContract(true)
    }

    // let contract2 = await askForContract()

    // while(!contract2) {
    //     contract2 = await askForContract(true)
    // }

    // let contract3 = await askForContract()

    // while(!contract3) {
    //     contract3 = await askForContract(true)
    // }

    // let contract4 = await askForContract()

    // while(!contract4) {
    //     contract4 = await askForContract(true)
    // }

    // let contract5 = await askForContract()

    // while(!contract5) {
    //     contract5 = await askForContract(true)
    // }

    const strategy1 = new CrossoverStrategy({
        contract: contract1,
        barType: 'MinuteBar',
        barInterval: 1,
        elementSizeUnit: 'UnderlyingUnits',
        histogram: false,
        timeRangeType: 'asMuchAsElements',
        timeRangeValue: 41,
        longPeriod: 13,
        shortPeriod: 5,
        variancePeriod: 34,
        orderQuantity: 1,
        dev_mode: !!maybeReplayString,
        replay_periods: REPLAY_TIMES
    })

    // const strategy2 = new CrossoverStrategy({
    //     contract: contract2,
    //     barType: 'MinuteBar',
    //     barInterval: 5,
    //     elementSizeUnit: 'UnderlyingUnits',
    //     histogram: false,
    //     timeRangeType: 'asMuchAsElements',
    //     timeRangeValue: 34,
    //     longPeriod: 13,
    //     shortPeriod: 5,
    //     variancePeriod: 34,
    //     orderQuantity: 1,
    //     dev_mode: !!maybeReplayString,
    //     replay_periods: [
    //         maybeReplayString
    //     ]
    // })
    
    // const strategy3 = new CrossoverStrategy({
    //     contract: contract3,
    //     barType: 'MinuteBar',
    //     barInterval: 5,
    //     elementSizeUnit: 'UnderlyingUnits',
    //     histogram: false,
    //     timeRangeType: 'asMuchAsElements',
    //     timeRangeValue: 34,
    //     longPeriod: 13,
    //     shortPeriod: 5,
    //     variancePeriod: 34,
    //     orderQuantity: 1,
    //     dev_mode: !!maybeReplayString,
    //     replay_periods: [
    //         maybeReplayString
    //     ]
    // })

    // const strategy4 = new CrossoverStrategy({
    //     contract: contract4,
    //     barType: 'MinuteBar',
    //     barInterval: 5,
    //     elementSizeUnit: 'UnderlyingUnits',
    //     histogram: false,
    //     timeRangeType: 'asMuchAsElements',
    //     timeRangeValue: 34,
    //     longPeriod: 13,
    //     shortPeriod: 5,
    //     variancePeriod: 34,
    //     orderQuantity: 1,
    //     dev_mode: !!maybeReplayString,
    //     replay_periods: [
    //         maybeReplayString
    //     ]
    // })

    // const strategy5 = new CrossoverStrategy({
    //     contract: contract5,
    //     barType: 'MinuteBar',
    //     barInterval: 5,
    //     elementSizeUnit: 'UnderlyingUnits',
    //     histogram: false,
    //     timeRangeType: 'asMuchAsElements',
    //     timeRangeValue: 34,
    //     longPeriod: 13,
    //     shortPeriod: 5,
    //     variancePeriod: 34,
    //     orderQuantity: 1,
    //     dev_mode: !!maybeReplayString,
    //     replay_periods: [
    //         maybeReplayString
    //     ]
    // })
}

main()