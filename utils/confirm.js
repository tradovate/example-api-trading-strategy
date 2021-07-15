const { askQuestion } = require("./askQuestion")

const confirm = async (params, yesFn, noFn) => {
    let _params = { ...params }

    console.clear()
    const prefix = Object.entries(_params)
        .map(([k, v], i) => `${i > 0 ? '[Tradobot]: ' : ''}You chose ${typeof v === 'object' ? v.name : v} for parameter ${k}.`)
        .join('\n')

    const yes = await askQuestion({
        question: prefix + '\nIs this information correct?',
        items: {
            Yes: true,
            No: false
        }
    })

    if(yes) {
        await yesFn()
    } else {
        _params = await noFn()
    }

    return _params
}

module.exports = { confirm }