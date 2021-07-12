const { pressEnterToContinue } = require('./modules/enterToContinue')
const { acquireAccess } = require('./modules/acquireAccess')
const { configureRobot } = require('./modules/configureRobot')
const { getHistory } = require('./modules/getHistory')
const { waitUntil } = require('./modules/waitUntil')

//ENVIRONMENT VARIABLES ---------------------------------------------------------------------------------------

//Set some process variables for ease-of-access. These values will be globally available
//through the process.env object. This is part of the configuration of the robot,
//so be sure to use the correct values here.

// - HTTP_URL can be changed to either the demo or live variant. Demo uses your demo account (if you have one)
// - USER should be your username or email used for your Trader account
// - PASS should be the password assoc with that account.

process.env.HTTP_URL    = 'https://demo-d.tradovateapi.com/v1'
process.env.WS_URL      = 'wss://demo-d.tradovateapi.com/v1/websocket'
process.env.MD_URL      = 'wss://md-d.tradovateapi.com/v1/websocket'
process.env.USER        = 'alennert02'    
process.env.PASS        = 'YumD00d24!' 
process.env.SEC         = 'f03741b6-f634-48d6-9308-c8fb871150c2'
process.env.CID         = 8

//END ENVIRONMENT VARIABLES -----------------------------------------------------------------------------------

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

    const Strategy = await configureRobot()

    waitUntil(() => Strategy.initialized)

    await pressEnterToContinue()

    // // // // // // // // // // // // // // // //
    // Run Strategy Section                      //
    // // // // // // // // // // // // // // // //

    await Strategy.run()

    process.exit(0)

}

main()