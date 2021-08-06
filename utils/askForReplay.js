const { askQuestion } = require("./askQuestion")

const askForReplay = async (times = []) => {
    const shouldRunReplay = await askQuestion({
        question: 'Would you like to run a Market Replay back-testing session?',
        items: {
            Yes: true,
            No: false
        }
    })

    let safeShouldRun

    if(typeof shouldRunReplay === 'string') {
        if(shouldRunReplay === 'true') {
            safeShouldRun = true         
        } else { 
            safeShouldRun = false
        }
    }
    else if(typeof shouldRunReplay === 'boolean') {
        safeShouldRun = shouldRunReplay
    }
    
    if(safeShouldRun) {
        if(times.length === 0) {
            // '2021-05-03T00:00' //format
            const year = await chooseYear()
            const month = await chooseMonth()
            const day = await chooseDay()
            const hour = await chooseHour()
            const minute = await chooseMinute()
    
            return new Date(`${year}-${month}-${day}T${hour}:${minute}`).toJSON()
        } else {
            return times[0].start
        }
    }

    return false
}

const chooseYear = async () => {
    return await askQuestion({
        question: 'Choose a year.',
        items: {
            '2021': '2021',
            '2020': '2020',
            '2019': '2019',
            '2018': '2018'
        }
    })
}

const chooseMonth = async () => {
    return await askQuestion({
        question: 'Choose a year.',
        items: {
            Jan: '01',
            Feb: '02',
            Mar: '03',
            Apr: '04',
            May: '05',
            Jun: '06',
            Jul: '07',
            Aug: '08',
            Sep: '09',
            Oct: '10',
            Nov: '11',
            Dec: '12'
        }
    })
}

const checkValid00 = res => {
    let maybeDay = null

    if(res.length !== 2) maybeDay = false

    if(maybeDay === null) {
        for(let i = 0; i < res.length; i++) {
            let cc = res.charCodeAt(i)
            if(cc < 30 || cc > 39) {
                maybeDay = false
            }
            maybeDay = res
        }
    }
    return maybeDay
}

const chooseDay = async () => {
    let maybeDay = null
    let res = await askQuestion({question: `Enter the Day in the format '00'`})

    maybeDay = checkValid00(res)

    return typeof maybeDay === 'boolean' ? await chooseDay() : maybeDay

}

const chooseHour = async () => {
    let maybeHour = null
    let res = await askQuestion({question: `Enter the Hour in the format '00'`})

    maybeHour = checkValid00(res)

    return typeof maybeHour === 'boolean' ? await chooseDay() : maybeHour
}

const chooseMinute = async () => {
    let maybeMinute = null
    let res = await askQuestion({question: `Enter the Minute in the format '00'`})

    maybeMinute = checkValid00(res)

    return typeof maybeMinute === 'boolean' ? await chooseDay() : maybeMinute

}

module.exports = { askForReplay }