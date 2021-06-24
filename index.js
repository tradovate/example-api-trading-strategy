const { MarketDataSocket } = require('./websocket/MarketDataSocket')
const { TradovateSocket } = require('./websocket/TradovateSocket')
const { waitUntil, waitForMs, calculateSma } = require('./utils')
const { askQuestion } = require('./modules/askQuestion')
const { pressEnterToContinue } = require('./modules/enterToContinue')
const { CrossoverStrategy } = require('./strategies/crossoverStrategy')
const { confirm } = require('./modules/confirm')
//Tradovate REST API Endpoints
const requestAccessToken = require('./endpoints/requestAccessToken')
const accountList = require('./endpoints/accountList')
const contractSuggest = require('./endpoints/contractSuggest')

//ENVIRONMENT VARIABLES ---------------------------------------------------------------------------------------

//Set some process variables for ease-of-access. These values will be globally available
//through the process.env object. This is part of the configuration of the robot,
//so be sure to use the correct values here.

// - HTTP_URL can be changed to either the demo or live variant. Demo uses your demo account (if you have one)
// - USER should be your username or email used for your Trader account
// - PASS should be the password assoc with that account.

process.env.HTTP_URL    = 'https://demo.tradovateapi.com/v1'
process.env.WS_URL      = 'wss://demo.tradovateapi.com/v1/websocket'
process.env.MD_URL      = 'wss://md.tradovateapi.com/v1/websocket'
process.env.USER        = '<Your Credentials Here>'    
process.env.PASS        = '<Your Credentials Here>' 

//END ENVIRONMENT VARIABLES -----------------------------------------------------------------------------------


const mdSocket = new MarketDataSocket()

/**
 * Program entry point.
 */
async function main() {

    // // // // // // // // // // // // // // // //
    // Login Section                             //
    // // // // // // // // // // // // // // // //

    console.clear()
    console.log('[Tradobot]: Acquiring an Access Token using your credentials...')

    await requestAccessToken()

    console.log('[Tradobot]: Successfully acquired Access Token.')

    await pressEnterToContinue()

    const accounts = await accountList()

    const chooseAccountItems = {}
    accounts.forEach(acct => {
        chooseAccountItems[acct.name] = acct
    })

    let account = await askQuestion({
        question: 'Please choose an account:',
        items: chooseAccountItems
    })

    process.env.ACCOUNT = JSON.stringify(account)

    console.clear()
    console.log(account)
    console.log(`\n[Tradobot]: Welcome, ${process.env.USER}.`)

    await pressEnterToContinue()

    // // // // // // // // // // // // // // // //
    // Configuration Section                     //
    // // // // // // // // // // // // // // // //

    //You can add your strategies to the items object.

    console.clear()
    console.log(`[Tradobot]: Help me configure a strategy. `)

    await pressEnterToContinue()

    const askForContract = async (failed = false) => {
        const maybeContract = await askQuestion({
            question: 
                failed ? `I couldn't find a contract with that name. Please enter another query.`
                       : `First let's find a contract. Enter some text and I'll search for a contract.`
        })
        
        const foundContracts = await contractSuggest(maybeContract.toUpperCase())

        const contractItems = {}
        let choiceContract

        if(foundContracts && (foundContracts.name !== 'Error' || foundContracts.name !== "TypeError") && foundContracts.length > 0) {
            foundContracts.forEach(ct => contractItems[ct.name] = ct)
            
            choiceContract = await askQuestion({
                question: `I found these possible contracts`,
                items: contractItems
            }) 

            return choiceContract
        }    
        return null
    }
    
    let contract = await askForContract()

    while(!contract) {
        contract = await askForContract(true)
    }

    console.log(contract)

    await pressEnterToContinue()

    const StrategyType = await askQuestion({
        question: 'Choose a strategy:',
        items: {
            'Crossover Strategy': CrossoverStrategy
        }
    })

    const getParams = async () => {
        const captured_params = {}

        const keys = Object.keys(StrategyType.params)

        for(let i = 0; i < keys.length; i++) {
            let k = keys[i]
            let rawInput = await askQuestion({
                question: `Please supply a parameter for '${k}'`
            })

            value = StrategyType.params[k]

            rawInput = 
                value === 'string'  ? rawInput
            :   value === 'int'     ? parseInt(rawInput, 10)
            :   value === 'float'   ? parseFloat(rawInput)
            :                         rawInput

            captured_params[k] = rawInput
        }
        
        captured_params.barType = await askQuestion({
            question: 'What type of data do you want to track?',
            items: {
                Tick: 'Tick',
                MinuteBar: 'MinuteBar'
            }
        })

        captured_params.barInterval = parseInt(await askQuestion({
            question: 'What interval do you want to measure by? Enter a number.'
        }), 10)

        return await confirm(captured_params, async () => captured_params, getParams)
    }

    const params = await getParams()
    params.contract = contract
    console.log(params)
    const concreteStrategy = new StrategyType(params)
    await pressEnterToContinue()

    // // // // // // // // // // // // // // // //
    // Connect WebSocket Section                 //
    // // // // // // // // // // // // // // // //

    await concreteStrategy.run()

    process.exit(0)

}

main()