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

    await connectSockets()

    // // // // // // // // // // // // // // // //
    // Configuration Section                     //
    // // // // // // // // // // // // // // // //

    const maybeReplayString = await askForReplay()

    // const Strategy = await configureRobot(ALL_STRATEGIES)

    //COMMENT ABOVE, UNCOMMENT BELOW you want to parameterize the strategy here instead of via console.
    // const minus24h = new Date(new Date().getTime() - 1000*60*60*24)
    // minus24h.setHours(7)

    // const replaySocket = new ReplaySocket()
    // replaySocket.connect(process.env.REPLAY_URL).then(() => {
    //     replaySocket.checkReplaySession({
    //         startTimestamp: minus24h.toJSON(),
    //         callback: (item) => {
    //             if(item.checkStatus && item.checkStatus === 'OK') {
    //                 replaySocket.initializeClock({
    //                     startTimestamp: minus24h.toJSON()
    //                 })
    //             }
    //         }
    //     })
    // })

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
        barInterval: 5,
        elementSizeUnit: 'UnderlyingUnits',
        histogram: false,
        timeRangeType: 'asMuchAsElements',
        timeRangeValue: 41,
        longPeriod: 13,
        shortPeriod: 5,
        variancePeriod: 41,
        orderQuantity: 10,
        dev_mode: !!maybeReplayString,
        replay_periods: [
            maybeReplayString
        ]
    })

    // const strategy2 = new CrossoverStrategy({
    //     contract: contract2,
    //     barType: 'MinuteBar',
    //     barInterval: 5,
    //     elementSizeUnit: 'UnderlyingUnits',
    //     histogram: false,
    //     timeRangeType: 'asMuchAsElements',
    //     timeRangeValue: 41,
    //     longPeriod: 13,
    //     shortPeriod: 5,
    //     variancePeriod: 41,
    //     orderQuantity: 10,
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
    //     timeRangeValue: 41,
    //     longPeriod: 13,
    //     shortPeriod: 5,
    //     variancePeriod: 41,
    //     orderQuantity: 10,
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
    //     timeRangeValue: 41,
    //     longPeriod: 13,
    //     shortPeriod: 5,
    //     variancePeriod: 41,
    //     orderQuantity: 10,
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
    //     timeRangeValue: 41,
    //     longPeriod: 13,
    //     shortPeriod: 5,
    //     variancePeriod: 41,
    //     orderQuantity: 10,
    //     dev_mode: !!maybeReplayString,
    //     replay_periods: [
    //         maybeReplayString
    //     ]
    // })
}

main()