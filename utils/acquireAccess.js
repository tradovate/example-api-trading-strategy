const accountList = require("../endpoints/accountList")
const requestAccessToken = require("../endpoints/requestAccessToken")
const { askQuestion } = require("./askQuestion")
const { pressEnterToContinue } = require("./enterToContinue")

const acquireAccess = async () => {

    console.clear()
    console.log('[AutoTrade]: Acquiring an Access Token using your credentials...')

    await requestAccessToken()

    console.log('[AutoTrade]: Successfully acquired Access Token.')

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
    process.env.ID = account.id,
    process.env.SPEC = account.name
    process.env.USER_ID = account.userId

    console.clear()
    console.log(account)
    console.log(`\n[AutoTrade]: Welcome, ${process.env.USER}.`)

    await pressEnterToContinue()
}

module.exports = { acquireAccess }