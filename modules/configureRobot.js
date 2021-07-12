const contractSuggest = require("../endpoints/contractSuggest")
const { CrossoverStrategy } = require("../strategies/crossoverStrategy")
const { YourCustomStrategy } = require("../strategies/yourCustomStrategy")
const { askQuestion } = require("./askQuestion")
const { confirm } = require("./confirm")
const { pressEnterToContinue } = require("./enterToContinue")


/**
 * To add your own strategies, add your own keys and strategy objects. The key determines how the choice will be displayed in the menu.
 */
const ALL_STRATEGIES = {
    'Crossover Strategy': CrossoverStrategy,
    'Your Custom Strategy': YourCustomStrategy
}

const configureRobot = async () => {

    console.clear()

    const askForContract = async (failed = false) => {
        const maybeContract = await askQuestion({
            question: 
                failed ? `I couldn't find a contract with that name. Please enter another query.`
                    : `Choose a contract to trade. Enter some text and I'll search for a contract.`
        })
        
        const foundContracts = await contractSuggest(maybeContract.toUpperCase())

        const contractItems = {}
        let choiceContract

        if(foundContracts && (foundContracts.name !== 'Error' || foundContracts.name !== "TypeError") && foundContracts.length > 0) {

            foundContracts.forEach(ct => contractItems[ct.name] = ct)
            contractItems['Try another query...'] = null
            
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
        items: ALL_STRATEGIES
    })

    const getParams = async () => {
        const captured_params = {}

        const keys = Object.keys(StrategyType.params)

        for(let i = 0; i < keys.length; i++) {
            let k = keys[i]

            let rawInput
            if(k === 'contract') {
                rawInput = contract
            }
            else if(typeof StrategyType.params[k] === 'object') {
                rawInput = await askQuestion({
                    question: `Please choose an option for '${k}'`,
                    items: StrategyType.params[k]
                })
            }
            else {
                rawInput = await askQuestion({
                    question: `Please supply a parameter for '${k}'`
                })
            }

            value = StrategyType.params[k]

            rawInput = 
                value === 'string'  ? rawInput
            :   value === 'int'     ? parseInt(rawInput, 10)
            :   value === 'float'   ? parseFloat(rawInput)
            :                         rawInput

            captured_params[k] = rawInput
        }

        return await confirm(captured_params, async () => captured_params, getParams)
    }

    const params = await getParams()
    console.log(params)
    const concreteStrategy = new StrategyType(params)

    return concreteStrategy
}

module.exports = { configureRobot }