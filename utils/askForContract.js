const contractSuggest = require("../endpoints/contractSuggest")
const { askQuestion } = require("./askQuestion")

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

module.exports = { askForContract }