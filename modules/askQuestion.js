const { waitUntil, KEYS } = require("../utils")

const drawQuestion = (choices, selected) => {
    const { question, items } = choices

    console.clear()
    console.log(`[Tradobot]: ${question}\n`)
    if(items) {
        Object.keys(items).forEach((k, i) => {
            console.log(`  ${selected === i ? `> [${i+1}.] ` : `  [${i+1}.] `}${k}`)
        })
    }
}

const badChars = [
    '\u0008', ',', '.', '!', '#', '&', '%', '$', '^', '*', '(', ')', '-', '+'
]

function sanitize(input) {
    let output = ''
    for (let i = 0; i < input.length; i++) {
        if (input.charCodeAt(i) <= 127 && !badChars.includes(input[i])) {
            output += input[i]
        }
    }
    return output
}

const askQuestion = async (choices) => {
    let madeChoice = false
    let input = ''
    let selected = 0
    
    const { items } = choices
    let keys 

    if(items) {
        keys = Object.keys(items)
    }

    const isSelectorInput = !!items

    const selectorLoop = buffer => {
        const str = buffer.toString('hex')
        switch(str) {
            case KEYS.up:
                selected = selected === 0 ? keys.length - 1 : selected - 1
                break
            case KEYS.down:
                selected = selected === keys.length - 1 ? 0 :  selected + 1
                break
            case KEYS.enter:
                madeChoice = true
                break
            default:
                break
        }
        
        if(!madeChoice) {
            drawQuestion(choices, selected)
        }
    }
    
    const inputLoop = buffer => {
        const str = buffer.toString('utf-8')
        if(buffer.toString('hex') === KEYS.enter) {
            madeChoice = true
        } else {
            input = input + str
        }
    }

    const listener = buffer => {
        isSelectorInput ? selectorLoop(buffer) :  inputLoop(buffer)
    }

    process.stdin.addListener('data', listener)

    drawQuestion(choices, selected)

    await waitUntil(() => madeChoice)

    process.stdin.removeListener('data', listener)

    return isSelectorInput ? choices.items[keys[selected]] : sanitize(input)
}

module.exports = { askQuestion }