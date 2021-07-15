const { askForContract } = require("./askForContract")
const { askQuestion } = require("./askQuestion")
const { confirm } = require("./confirm")
const { pressEnterToContinue } = require("./enterToContinue")

const configureRobot = async (ALL_STRATEGIES) => {

    console.clear()    
    
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