const { KEYS, waitUntil, readline, io } = require("../utils")

const pressEnterToContinue = async (customText = 'continue') => {
    let pressedEnter = false

    console.log(`\nPress enter to ${customText}...`)
    
    const listener = buffer => {
        const maybeEnter = buffer.toString('hex')

        if(maybeEnter === KEYS.enter) {
            pressedEnter = true
        } else {
            readline.clearLine(process.stdout)
            readline.cursorTo(process.stdout, 0, io.getCursorPos().y)
        }
    }

    process.stdin.addListener('data', listener)

    await waitUntil(() => pressedEnter)

    process.stdin.removeListener('data', listener)

}

module.exports = { pressEnterToContinue }